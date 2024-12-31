import { auth, firestore, storage } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    deleteDoc
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'firebase/storage';

export class StoryService {
    static async createStory(imageFile) {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Kullanıcı girişi yapılmamış');
        }

        try {
            const storageRef = ref(storage, `stories/${user.uid}/${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await addDoc(collection(firestore, 'stories'), {
                userId: user.uid,
                imageUrl: downloadURL,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });

            return downloadURL;
        } catch (error) {
            console.error('Hikaye paylaşma hatası:', error);
            throw error;
        }
    }

    static async fetchUserStories(userId) {
        try {
            const storiesQuery = query(
                collection(firestore, 'stories'),
                where('userId', '==', userId),
                where('expiresAt', '>', new Date())
            );

            const storiesSnapshot = await getDocs(storiesQuery);

            return storiesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Hikayeler getirilirken hata:', error);
            throw error;
        }
    }

    static async deleteExpiredStories() {
        try {
            const expiredStoriesQuery = query(
                collection(firestore, 'stories'),
                where('expiresAt', '<=', new Date())
            );

            const expiredStoriesSnapshot = await getDocs(expiredStoriesQuery);

            expiredStoriesSnapshot.forEach(async (storyDoc) => {
                await deleteDoc(storyDoc.ref);
            });
        } catch (error) {
            console.error('Süresi dolan hikayeleri silme hatası:', error);
        }
    }
}