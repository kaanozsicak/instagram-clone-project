import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'firebase/storage';
import { storage } from './firebase-config.js';

export class StorageService {
    static async uploadProfileImage(file, userId) {
        try {
            const fileName = `profile_${userId}_${Date.now()}.${file.name.split('.').pop()}`;
            
            const storageRef = ref(
                storage, 
                `profile_pictures/${userId}/${fileName}`
            );

            const snapshot = await uploadBytes(storageRef, file);
            
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            return downloadURL;
        } catch (error) {
            console.error('Profil resmi yükleme hatası:', error);
            throw error;
        }
    }
}