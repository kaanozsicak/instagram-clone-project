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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthService } from './auth-service.js';

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
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            const followingRef = doc(firestore, 'followers', currentUser.uid);
            const followingSnap = await getDoc(followingRef);

            if (!followingSnap.exists()) {
                return [];
            }

            const followedUsers = followingSnap.data().following || [];

            const postsRef = collection(firestore, 'posts');
            const q = query(
                postsRef,
                where('userId', 'in', [...followedUsers, currentUser.uid]),
                orderBy('timestamp', 'desc'),
                limit(50)
            );

            const querySnapshot = await getDocs(q);

            const posts = [];
            for (const postDoc of querySnapshot.docs) {
                const postData = postDoc.data();

                const userRef = doc(firestore, 'users', postData.userId);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();

                posts.push({
                    id: postDoc.id,
                    ...postData,
                    username: userData.username,
                    profileImage: userData.profileImage,
                });
            }

            return posts;
        } catch (error) {
            console.error(
                'Takip edilen kullanıcıların gönderileri alınırken hata:',
                error
            );
            return [];
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
