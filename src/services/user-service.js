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
    arrayRemove
} from 'firebase/firestore';

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
                following: arrayUnion(targetUserId)
            });

            const targetUserDocRef = doc(firestore, 'users', targetUserId);
            await updateDoc(targetUserDocRef, {
                followers: arrayUnion(user.uid)
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
                following: arrayRemove(targetUserId)
            });

            const targetUserDocRef = doc(firestore, 'users', targetUserId);
            await updateDoc(targetUserDocRef, {
                followers: arrayRemove(user.uid)
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
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Kullanıcı arama hatası:', error);
            throw error;
        }
    }
}