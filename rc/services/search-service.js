static async searchUsers(searchTerm) {
    try {
        // Boş veya çok kısa aramalar için kontrol
        if (!searchTerm || searchTerm.trim().length < 2) {
            return [];
        }

        const usersRef = collection(firestore, 'users');
        
        // Ad soyad araması için query
        const fullNameQuery = query(
            usersRef,
            where('fullName', '>=', searchTerm),
            where('fullName', '<=', searchTerm + '\uf8ff'),
            limit(5)
        );

        const querySnapshot = await getDocs(fullNameQuery);
        
        const results = [];
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            // Sonuçları kontrol et ve ekle
            if (userData.fullName && userData.fullName.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push({
                    uid: doc.id,
                    username: userData.username || '',
                    fullName: userData.fullName || '',
                    profileImage: userData.profileImage || '/default-avatar.png'
                });
            }
        });

        console.log('Arama sonuçları:', results);
        return results;

    } catch (error) {
        console.error('Kullanıcı arama hatası:', error);
        return []; // Hata durumunda boş dizi döndür
    }
}