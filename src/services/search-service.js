import { 
    collection, 
    query, 
    where, 
    getDocs,
    limit
} from 'firebase/firestore';
import { firestore } from './firebase-config.js';

export class SearchService {
    static async searchUsers(searchTerm) {
        try {
            // Boş veya çok kısa aramalar için kontrol
            if (!searchTerm || searchTerm.trim().length < 2) {
                return [];
            }

            // Kullanıcı adı için regex kontrolü
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(searchTerm.trim())) {
                console.warn('Geçersiz arama terimi');
                return [];
            }

            const usersRef = collection(firestore, 'users');
            
            // Birden fazla arama kriteri
            const searchQueries = [
                // Kullanıcı adında arama
                query(
                    usersRef, 
                    where('username', '>=', searchTerm.toLowerCase()),
                    where('username', '<=', searchTerm.toLowerCase() + '\uf8ff'),
                    limit(10)
                ),
                // Ad soyad içinde arama
                query(
                    usersRef, 
                    where('fullName', '>=', searchTerm),
                    where('fullName', '<=', searchTerm + '\uf8ff'),
                    limit(10)
                )
            ];

            // Her iki sorguda da sonuç toplama
            const results = [];
            for (const searchQuery of searchQueries) {
                const querySnapshot = await getDocs(searchQuery);
                
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    
                    // Tekrar eden sonuçları engelle
                    if (!results.some(user => user.uid === doc.id)) {
                        results.push({
                            uid: doc.id,
                            username: userData.username || '',
                            fullName: userData.fullName || '',
                            profileImage: userData.profileImage || '/default-avatar.png'
                        });
                    }
                });
            }

            // Sonuçları sınırla ve benzersiz yap
            const uniqueResults = results.slice(0, 10);

            // Eğer hiç sonuç bulunamazsa bilgilendirme
            if (uniqueResults.length === 0) {
                console.log('Arama kriterlerine uygun kullanıcı bulunamadı');
            }

            console.log('SearchService sonuçları:', uniqueResults);
            return uniqueResults;
        } catch (error) {
            console.error('Kullanıcı arama hatası:', error);
            
            // Hata türüne göre özel mesajlar
            if (error.code === 'permission-denied') {
                console.error('Firestore arama izni reddedildi');
            } else if (error.code === 'unavailable') {
                console.error('Firestore şu anda kullanılamıyor');
            }
            
            return [];
        }
    }

    // İleride eklenebilecek ek arama metodları için alan
    static async searchPosts(searchTerm) {
        // Gelecekte post arama özelliği eklenebilir
        return [];
    }

    static async searchHashtags(hashtag) {
        // Gelecekte hashtag arama özelliği eklenebilir
        return [];
    }
}

export default SearchService;