import { firestore } from './firebase-config.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export class ProfileService {
    static async updatePrivacySettings(userId, isPrivate) {
        try {
            const userRef = doc(firestore, 'users', userId);
            await updateDoc(userRef, {
                isPrivate: isPrivate,
            });
            return true;
        } catch (error) {
            console.error('Gizlilik ayarları güncellenirken hata:', error);
            throw error;
        }
    }

    static async getPrivacySettings(userId) {
        try {
            const userRef = doc(firestore, 'users', userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                return false; // Varsayılan olarak hesap herkese açık
            }

            return userDoc.data().isPrivate || false;
        } catch (error) {
            console.error('Gizlilik ayarları alınırken hata:', error);
            return false; // Hata durumunda hesabı herkese açık varsay
        }
    }
}

export default ProfileService;
