import { firestore, storage } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    doc, 
    getDoc, 
    updateDoc, 
    deleteDoc,
    orderBy,
    limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthService } from './auth-service.js';

export class PostService {
    static async uploadPost(file, caption = '') {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            const storageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const postData = {
                userId: currentUser.uid,
                imageUrl: downloadURL,
                caption: caption,
                likes: 0,
                comments: [],
                timestamp: new Date()
            };

            const docRef = await addDoc(collection(firestore, 'posts'), postData);

            return {
                id: docRef.id,
                ...postData
            };
        } catch (error) {
            console.error('Gönderi yükleme hatası:', error);
            throw error;
        }
    }

    static async getUserPosts(username) {
        try {
            const userRef = collection(firestore, 'users');
            const q = query(userRef, where('username', '==', username.toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error('Kullanıcı bulunamadı');
            }

            const userDoc = querySnapshot.docs[0];
            const userId = userDoc.id;

            const postsRef = collection(firestore, 'posts');
            const postsQuery = query(
                postsRef, 
                where('userId', '==', userId),
                orderBy('timestamp', 'desc')
            );

            const postsSnapshot = await getDocs(postsQuery);

            return postsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Kullanıcı gönderileri alınırken hata:', error);
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
                    profileImage: userData.profileImage
                });
            }

            return posts;
        } catch (error) {
            console.error('Takip edilen kullanıcıların gönderileri alınırken hata:', error);
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
                profileImage: userData.profileImage
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
                likes: updatedLikes
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
                timestamp: new Date()
            };

            const postData = postSnap.data();
            const updatedComments = [...(postData.comments || []), newComment];

            await updateDoc(postRef, {
                comments: updatedComments
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