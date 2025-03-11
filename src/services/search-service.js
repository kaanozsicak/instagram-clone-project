import { firestore } from './firebase-config.js';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export class SearchService {
    /**
     * Kullanıcı aramayı gerçekleştirir
     * @param {string} searchTerm - Arama terimi
     * @returns {Promise<Array>} - Bulunan kullanıcıların listesi
     */
    static async searchUsers(searchTerm) {
        try {
            if (!searchTerm || searchTerm.length < 2) {
                return [];
            }

            const searchTermLower = searchTerm.toLowerCase();

            const usersRef = collection(firestore, 'users');

            // Kullanıcı adı araması
            const q1 = query(
                usersRef,
                where('username', '>=', searchTermLower),
                where('username', '<=', searchTermLower + '\uf8ff'),
                limit(5)
            );

            const snapshot1 = await getDocs(q1);

            // İsim araması
            const q2 = query(
                usersRef,
                where('fullName', '>=', searchTermLower),
                where('fullName', '<=', searchTermLower + '\uf8ff'),
                limit(5)
            );

            const snapshot2 = await getDocs(q2);

            // Sonuçları birleştir ve tekrarları kaldır
            const results = [];
            const userIds = new Set();

            // İlk sorgudan gelen sonuçları ekle
            snapshot1.forEach((doc) => {
                if (!userIds.has(doc.id)) {
                    userIds.add(doc.id);
                    results.push({
                        uid: doc.id,
                        ...doc.data(),
                    });
                }
            });

            // İkinci sorgudan gelen sonuçları ekle
            snapshot2.forEach((doc) => {
                if (!userIds.has(doc.id)) {
                    userIds.add(doc.id);
                    results.push({
                        uid: doc.id,
                        ...doc.data(),
                    });
                }
            });

            console.log(`Arama sonuçları (${searchTermLower}):`, results);
            return results;
        } catch (error) {
            console.error('Kullanıcı arama hatası:', error);
            return [];
        }
    }
}

export default SearchService;
