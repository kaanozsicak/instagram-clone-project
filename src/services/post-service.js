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
    limit, // limit fonksiyonunu ekleyelim
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthService } from './auth-service.js';
import { FollowService } from './follow-service.js'; // FollowService'i import et

export class PostService {
    static async getUserPosts(username) {
        try {
            // Önce kullanıcının uid'sini username'e göre bulalım
            const usersRef = collection(firestore, 'users');
            const userQuery = query(
                usersRef,
                where('username', '==', username.toLowerCase())
            );
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                throw new Error('Kullanıcı bulunamadı');
            }

            const userId = userSnapshot.docs[0].id;

            // Şimdi bu uid'ye ait postları alalım
            const postsRef = collection(firestore, 'posts');
            const postsQuery = query(
                postsRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const postsSnapshot = await getDocs(postsQuery);

            if (postsSnapshot.empty) {
                console.log('Kullanıcıya ait gönderi bulunamadı');
                return [];
            }

            const posts = [];
            postsSnapshot.forEach((doc) => {
                posts.push({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                });
            });

            console.log('Bulunan gönderiler:', posts);
            return posts;
        } catch (error) {
            console.error('Gönderiler alınırken hata:', error);
            throw error;
        }
    }

    static async uploadPost(imageFile, caption) {
        try {
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı girişi yapılmamış');
            }

            const userProfile = await AuthService.getUserProfile(
                currentUser.uid
            );

            // Resmi Storage'a yükle
            const imageRef = ref(
                storage,
                `posts/${currentUser.uid}/${Date.now()}_${imageFile.name}`
            );
            const uploadResult = await uploadBytes(imageRef, imageFile);
            const imageUrl = await getDownloadURL(uploadResult.ref);

            // Post bilgilerini Firestore'a kaydet
            const postData = {
                userId: currentUser.uid,
                username: userProfile.username,
                profileImage: userProfile.profileImage || '/default-avatar.png',
                imageUrl,
                caption,
                likes: 0,
                comments: [],
                createdAt: serverTimestamp(),
            };

            // Posts koleksiyonuna ekle
            const postsRef = collection(firestore, 'posts');
            const docRef = await addDoc(postsRef, postData);

            // Kullanıcının posts dizisine post ID'sini ekle
            const userRef = doc(firestore, 'users', currentUser.uid);
            await updateDoc(userRef, {
                posts: arrayUnion(docRef.id),
            });

            console.log('Yeni post yüklendi:', docRef.id);

            return {
                id: docRef.id,
                ...postData,
                createdAt: new Date(),
            };
        } catch (error) {
            console.error('Gönderi yükleme hatası:', error);
            throw error;
        }
    }

    static async getFollowedUsersPosts() {
        try {
            const currentUser = AuthService.getCurrentUser();
            console.log('Current user:', currentUser?.uid);

            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // İlgili servisi import et
            const FollowService = await import('./follow-service.js').then(
                (module) => module.default
            );

            // Kullanıcının takip ettiği kişilerin listesini al
            const followingUsers = await FollowService.getFollowing(
                currentUser.uid
            );
            console.log('Takip edilen kullanıcılar:', followingUsers);

            // Takip edilen kullanıcılar ve kendisi
            const usersToFetch = [...followingUsers, currentUser.uid];
            console.log('Gönderi aranacak kullanıcılar:', usersToFetch);

            const posts = [];

            // Her bir kullanıcı için gönderileri al
            for (const userId of usersToFetch) {
                try {
                    console.log(
                        `${userId} kullanıcısının gönderileri getiriliyor...`
                    );
                    const userPosts = await this.getUserPostsById(userId);
                    posts.push(...userPosts);
                } catch (error) {
                    console.warn(
                        `${userId} kullanıcısının gönderileri alınırken hata:`,
                        error
                    );
                }
            }

            // Gönderileri tarihe göre sırala (en yeniden en eskiye)
            posts.sort((a, b) => b.createdAt - a.createdAt);

            console.log('Toplam bulunan gönderi sayısı:', posts.length);
            return posts;
        } catch (error) {
            console.error('Gönderiler alınırken hata:', error);
            console.error('Hata detayı:', error);
            return [];
        }
    }

    // Tarih formatlama yardımcı fonksiyonu
    static formatDate(date) {
        try {
            const now = new Date();
            const diff = now - date;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 7) {
                return date.toLocaleDateString();
            } else if (days > 0) {
                return `${days} gün önce`;
            } else if (hours > 0) {
                return `${hours} saat önce`;
            } else if (minutes > 0) {
                return `${minutes} dakika önce`;
            } else {
                return 'Az önce';
            }
        } catch (error) {
            console.error('Tarih formatlama hatası:', error);
            return '';
        }
    }

    static async getPostById(postId) {
        try {
            const postRef = doc(firestore, 'posts', postId);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) {
                throw new Error('Gönderi bulunamadı');
            }

            const postData = postSnap.data();
            const userRef = doc(firestore, 'users', postData.userId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            return {
                id: postSnap.id,
                ...postData,
                username: userData.username,
                profileImage: userData.profileImage,
            };
        } catch (error) {
            console.error('Gönderi detayları alınırken hata:', error);
            throw error;
        }
    }

    static async likePost(postId) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            const postRef = doc(firestore, 'posts', postId);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) {
                throw new Error('Gönderi bulunamadı');
            }

            const postData = postSnap.data();
            const updatedLikes = (postData.likes || 0) + 1;

            await updateDoc(postRef, {
                likes: updatedLikes,
            });

            return updatedLikes;
        } catch (error) {
            console.error('Beğeni işlemi hatası:', error);
            throw error;
        }
    }

    static async addComment(postId, commentText) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            const userRef = doc(firestore, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            const postRef = doc(firestore, 'posts', postId);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) {
                throw new Error('Gönderi bulunamadı');
            }

            const newComment = {
                userId: currentUser.uid,
                username: userData.username,
                text: commentText,
                timestamp: new Date(),
            };

            const postData = postSnap.data();
            const updatedComments = [...(postData.comments || []), newComment];

            await updateDoc(postRef, {
                comments: updatedComments,
            });

            return newComment;
        } catch (error) {
            console.error('Yorum ekleme hatası:', error);
            throw error;
        }
    }

    static async getPostComments(postId) {
        try {
            const postRef = doc(firestore, 'posts', postId);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) {
                throw new Error('Gönderi bulunamadı');
            }

            const postData = postSnap.data();
            return postData.comments || [];
        } catch (error) {
            console.error('Yorumları alma hatası:', error);
            throw error;
        }
    }
}
