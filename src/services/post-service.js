import { firestore, storage } from './firebase-config.js';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    getDoc,
    doc,
    orderBy,
    serverTimestamp,
    updateDoc,
    arrayUnion,
    limit as firestoreLimit, // Rename to avoid conflicts
    Timestamp,
    startAfter,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthService } from './auth-service.js';
import { FollowService } from './follow-service.js';
import { NotificationService } from './notification-service.js';

export class PostService {
    /**
     * Verilen kullanıcı adına ait gönderileri getirir
     * @param {string} username - Gönderileri getirilecek kullanıcının kullanıcı adı
     * @returns {Promise<Array>} - Kullanıcının gönderileri
     */
    static async getUserPosts(username) {
        try {
            // Kullanıcının UID'sini bulmak için kullanıcı adıyla sorgula
            const usersRef = collection(firestore, 'users');
            const userQuery = query(
                usersRef,
                where('username', '==', username.toLowerCase())
            );
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                return [];
            }

            const userId = userSnapshot.docs[0].id;

            // Kullanıcının gönderilerini getir
            const postsRef = collection(firestore, 'posts');
            const postsQuery = query(
                postsRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const postsSnapshot = await getDocs(postsQuery);

            return postsSnapshot.docs.map((doc) => {
                const postData = doc.data();

                // Timestamp'i işlenebilir formata dönüştür
                const createdAt = postData.createdAt
                    ? postData.createdAt.toDate()
                    : new Date();

                return {
                    id: doc.id,
                    ...postData,
                    createdAt,
                    username: username,
                };
            });
        } catch (error) {
            console.error('Kullanıcı gönderileri alınırken hata:', error);
            return [];
        }
    }

    /**
     * Yeni gönderi yükler
     * @param {File} imageFile - Yüklenecek görsel dosyası
     * @param {string} caption - Gönderi açıklaması
     * @returns {Promise<Object>} - Yüklenen gönderinin bilgileri
     */
    static async uploadPost(imageFile, caption) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // Kullanıcı profilini getir
            const userProfile = await AuthService.getUserProfile(
                currentUser.uid
            );
            if (!userProfile) {
                throw new Error('Kullanıcı profili bulunamadı');
            }

            // Görseli storage'a yükle
            const storageRef = ref(
                storage,
                `posts/${currentUser.uid}/${Date.now()}_${imageFile.name}`
            );
            const uploadResult = await uploadBytes(storageRef, imageFile);
            const imageUrl = await getDownloadURL(uploadResult.ref);

            // Gönderi verilerini oluştur
            const postData = {
                userId: currentUser.uid,
                imageUrl: imageUrl,
                caption: caption || '',
                likes: 0,
                likesArray: [],
                comments: [],
                createdAt: serverTimestamp(),
            };

            // Firestore'a gönderi ekle
            const docRef = await addDoc(
                collection(firestore, 'posts'),
                postData
            );

            return {
                id: docRef.id,
                ...postData,
                imageUrl,
                username: userProfile.username,
            };
        } catch (error) {
            console.error('Gönderi yükleme hatası:', error);
            throw error;
        }
    }

    /**
     * Takip edilen kullanıcıların ve kendi gönderilerini getirir
     * @param {number} limitCount - Getirilecek gönderi sayısı
     * @param {string} startAfterPostId - Bu ID'den sonraki gönderileri getir
     * @returns {Promise<Array>} - Gönderilerin listesi
     */
    static async getFollowedUsersPosts(
        limitCount = 5,
        startAfterPostId = null
    ) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // Kullanıcının takip ettiği kişilerin listesini al
            const following = await FollowService.getFollowing(currentUser.uid);

            // Kullanıcı ID'lerini belirle (takip edilenler + kendisi)
            const userIds =
                following.length > 0
                    ? [...following, currentUser.uid]
                    : [currentUser.uid];

            // Base query
            let postsRef = collection(firestore, 'posts');
            let q = null;

            // Pagination için startAfter query
            if (startAfterPostId) {
                try {
                    const startAfterDoc = await getDoc(
                        doc(firestore, 'posts', startAfterPostId)
                    );

                    if (startAfterDoc.exists()) {
                        q = query(
                            postsRef,
                            where('userId', 'in', userIds),
                            orderBy('createdAt', 'desc'),
                            startAfter(startAfterDoc),
                            firestoreLimit(limitCount) // Use renamed import
                        );
                    } else {
                        // Eğer başlangıç dokümanı bulunamadıysa normal sorgu yap
                        q = query(
                            postsRef,
                            where('userId', 'in', userIds),
                            orderBy('createdAt', 'desc'),
                            firestoreLimit(limitCount) // Use renamed import
                        );
                    }
                } catch (error) {
                    console.error(
                        'Pagination hatası, normal query kullanılacak:',
                        error
                    );
                    q = query(
                        postsRef,
                        where('userId', 'in', userIds),
                        orderBy('createdAt', 'desc'),
                        firestoreLimit(limitCount) // Use renamed import
                    );
                }
            } else {
                // İlk yüklemede pagination olmadan query
                q = query(
                    postsRef,
                    where('userId', 'in', userIds),
                    orderBy('createdAt', 'desc'),
                    firestoreLimit(limitCount) // Use renamed import
                );
            }

            const querySnapshot = await getDocs(q);

            // Sonuçları işle ve kullanıcı bilgilerini ekle
            const posts = [];
            for (const docSnapshot of querySnapshot.docs) {
                const postData = docSnapshot.data();

                // Kullanıcı profil bilgilerini al
                const userRef = doc(firestore, 'users', postData.userId);
                const userDoc = await getDoc(userRef);
                const userData = userDoc.exists() ? userDoc.data() : {};

                posts.push({
                    id: docSnapshot.id,
                    ...postData,
                    username: userData.username || 'Kullanıcı',
                    profileImage:
                        userData.profilePicture ||
                        userData.profileImage ||
                        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4=',
                    createdAt: postData.createdAt
                        ? postData.createdAt.toDate()
                        : new Date(),
                });
            }

            return posts;
        } catch (error) {
            console.error('Gönderiler yüklenirken hata:', error);
            return [];
        }
    }

    /**
     * Gönderiyi beğen
     * @param {string} postId - Beğenilecek gönderinin ID'si
     * @returns {Promise<boolean>} - İşlem başarılı mı
     */
    static async likePost(postId) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // Gönderiyi al
            const postRef = doc(firestore, 'posts', postId);
            const postDoc = await getDoc(postRef);

            if (!postDoc.exists()) {
                throw new Error('Gönderi bulunamadı');
            }

            const postData = postDoc.data();
            const likesArray = postData.likesArray || [];

            // Kullanıcı daha önce beğenmiş mi kontrol et
            if (likesArray.includes(currentUser.uid)) {
                return false;
            }

            // Beğeni sayısını artır
            await updateDoc(postRef, {
                likes: (postData.likes || 0) + 1,
                likesArray: arrayUnion(currentUser.uid),
            });

            // Gönderinin sahibine bildirim gönder
            if (postData.userId !== currentUser.uid) {
                // Kullanıcı adını al
                const userProfileDoc = await getDoc(
                    doc(firestore, 'users', currentUser.uid)
                );
                const userProfile = userProfileDoc.exists()
                    ? userProfileDoc.data()
                    : {};

                await NotificationService.createNotification({
                    type: 'like',
                    recipientId: postData.userId,
                    senderUserId: currentUser.uid,
                    senderUsername: userProfile.username || 'Bir kullanıcı',
                    content: 'gönderinizi beğendi',
                    postId: postId,
                    createdAt: new Date(),
                });
            }

            return true;
        } catch (error) {
            console.error('Gönderi beğenme hatası:', error);
            throw error;
        }
    }

    /**
     * Gönderiye yorum ekle
     * @param {string} postId - Yorum yapılacak gönderinin ID'si
     * @param {string} text - Yorum metni
     * @returns {Promise<Object>} - Yorum bilgileri
     */
    static async addComment(postId, text) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // Kullanıcı profil bilgilerini al
            const userProfileDoc = await getDoc(
                doc(firestore, 'users', currentUser.uid)
            );
            const userProfile = userProfileDoc.exists()
                ? userProfileDoc.data()
                : {};

            // Yorum nesnesini oluştur
            const comment = {
                userId: currentUser.uid,
                username: userProfile.username || 'Kullanıcı',
                text: text,
                createdAt: new Date(),
            };

            // Gönderiyi güncelle
            const postRef = doc(firestore, 'posts', postId);
            await updateDoc(postRef, {
                comments: arrayUnion(comment),
            });

            // Gönderi sahibini al
            const postDoc = await getDoc(postRef);
            if (postDoc.exists()) {
                const postData = postDoc.data();

                // Gönderinin sahibine bildirim gönder (kendi gönderisine yorum yapmadıysa)
                if (postData.userId !== currentUser.uid) {
                    await NotificationService.createNotification({
                        type: 'comment',
                        recipientId: postData.userId,
                        senderUserId: currentUser.uid,
                        senderUsername: userProfile.username || 'Bir kullanıcı',
                        content: 'gönderinize yorum yaptı',
                        postId: postId,
                        createdAt: new Date(),
                    });
                }
            }

            return comment;
        } catch (error) {
            console.error('Yorum ekleme hatası:', error);
            throw error;
        }
    }

    /**
     * Gönderi ID'sine göre gönderi detaylarını getirir
     * @param {string} postId - Gönderi ID'si
     * @returns {Promise<Object|null>} - Gönderi bilgileri
     */
    static async getPostById(postId) {
        try {
            const postRef = doc(firestore, 'posts', postId);
            const postDoc = await getDoc(postRef);

            if (!postDoc.exists()) {
                return null;
            }

            const postData = postDoc.data();

            // Gönderi sahibinin kullanıcı bilgilerini al
            const userRef = doc(firestore, 'users', postData.userId);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.exists() ? userDoc.data() : {};

            return {
                id: postDoc.id,
                ...postData,
                username: userData.username || 'Kullanıcı',
                profileImage:
                    userData.profilePicture ||
                    userData.profileImage ||
                    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4=',
                createdAt: postData.createdAt
                    ? postData.createdAt.toDate()
                    : new Date(),
            };
        } catch (error) {
            console.error('Gönderi bilgileri alınırken hata:', error);
            return null;
        }
    }

    /**
     * Gönderi yorumlarını getirir
     * @param {string} postId - Gönderi ID'si
     * @returns {Promise<Array>} - Yorum listesi
     */
    static async getPostComments(postId) {
        try {
            const postRef = doc(firestore, 'posts', postId);
            const postDoc = await getDoc(postRef);

            if (!postDoc.exists()) {
                return [];
            }

            const postData = postDoc.data();
            return postData.comments || [];
        } catch (error) {
            console.error('Yorumlar alınırken hata:', error);
            return [];
        }
    }
}

export default PostService;
