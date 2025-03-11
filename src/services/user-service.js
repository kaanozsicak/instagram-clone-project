import { auth, firestore } from './firebase-config.js';
import {
    doc,
    updateDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    arrayUnion,
    arrayRemove,
    limit,
} from 'firebase/firestore';
import { FollowService } from './follow-service.js';

export class UserService {
    static async updateProfile(userData) {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Kullanıcı girişi yapılmamış');
        }

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, userData);
            return true;
        } catch (error) {
            console.error('Profil güncelleme hatası:', error);
            throw error;
        }
    }

    static async followUser(targetUserId) {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Kullanıcı girişi yapılmamış');
        }

        try {
            const currentUserDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(currentUserDocRef, {
                following: arrayUnion(targetUserId),
            });

            const targetUserDocRef = doc(firestore, 'users', targetUserId);
            await updateDoc(targetUserDocRef, {
                followers: arrayUnion(user.uid),
            });

            return true;
        } catch (error) {
            console.error('Kullanıcı takip etme hatası:', error);
            throw error;
        }
    }

    static async unfollowUser(targetUserId) {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Kullanıcı girişi yapılmamış');
        }

        try {
            const currentUserDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(currentUserDocRef, {
                following: arrayRemove(targetUserId),
            });

            const targetUserDocRef = doc(firestore, 'users', targetUserId);
            await updateDoc(targetUserDocRef, {
                followers: arrayRemove(user.uid),
            });

            return true;
        } catch (error) {
            console.error('Kullanıcı takipten çıkarma hatası:', error);
            throw error;
        }
    }

    static async searchUsers(username) {
        try {
            const usersRef = collection(firestore, 'users');
            const q = query(
                usersRef,
                where('username', '>=', username),
                where('username', '<=', username + '\uf8ff')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error('Kullanıcı arama hatası:', error);
            throw error;
        }
    }

    /**
     * Kullanıcıya önerilecek kullanıcıları getirir
     * @param {string} currentUserId - Mevcut kullanıcı ID'si
     * @param {number} count - Kaç kullanıcı önerilecek
     * @returns {Promise<Array>} - Önerilen kullanıcıların listesi
     */
    static async getSuggestedUsers(currentUserId, count = 5) {
        try {
            if (!currentUserId) {
                throw new Error('Kullanıcı ID gerekli');
            }

            // Kullanıcının zaten takip ettiği kullanıcıların listesini al
            const followingList = await FollowService.getFollowing(
                currentUserId
            );

            // Tüm kullanıcıları getir (limite göre)
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, limit(count * 3)); // Önerecek yeterli kullanıcı bulmak için daha fazla getir

            const querySnapshot = await getDocs(q);

            const allUsers = [];
            querySnapshot.forEach((doc) => {
                // Kullanıcının kendisini ve zaten takip ettiklerini hariç tut
                if (
                    doc.id !== currentUserId &&
                    !followingList.includes(doc.id)
                ) {
                    allUsers.push({ uid: doc.id, ...doc.data() });
                }
            });

            // Rastgele karıştır ve istenen sayıya kadar al
            const shuffled = allUsers.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        } catch (error) {
            console.error('Önerilen kullanıcılar getirilirken hata:', error);
            return [];
        }
    }

    /**
     * Kullanıcı adına göre kullanıcı bilgilerini getirir
     * @param {string} username - Kullanıcı adı
     * @returns {Promise<Object|null>} - Kullanıcı bilgileri veya null
     */
    static async getUserByUsername(username) {
        try {
            const usersRef = collection(firestore, 'users');
            const q = query(
                usersRef,
                where('username', '==', username.toLowerCase())
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            const userDoc = querySnapshot.docs[0];
            return {
                uid: userDoc.id,
                ...userDoc.data(),
            };
        } catch (error) {
            console.error('Kullanıcı bilgisi getirilirken hata:', error);
            return null;
        }
    }

    /**
     * Kullanıcı ID'sine göre kullanıcı bilgilerini getirir
     * @param {string} uid - Kullanıcı ID'si
     * @returns {Promise<Object|null>} - Kullanıcı bilgileri veya null
     */
    static async getUserById(uid) {
        try {
            const userRef = doc(firestore, 'users', uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                return null;
            }

            return {
                uid: userDoc.id,
                ...userDoc.data(),
            };
        } catch (error) {
            console.error('Kullanıcı bilgisi getirilirken hata:', error);
            return null;
        }
    }
}

export default UserService;
