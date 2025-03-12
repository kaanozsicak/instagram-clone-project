import { firestore } from '../services/firebase-config.js';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore';
import { AuthService } from '../services/auth-service.js';

/**
 * Veritabanındaki bozuk sohbet verilerini temizleyen admin aracı
 */
export class DatabaseRepairTool {
    /**
     * Kurulum ve yetki kontrolü
     */
    static async init() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            alert('Bu fonksiyonu kullanabilmek için oturum açmalısınız!');
            return false;
        }

        // Basit bir admin kontrolü (güvenlik için production'da daha güçlü bir kontrol yapılmalı)
        const userProfile = await AuthService.getUserProfile(currentUser.uid);
        if (!userProfile || !userProfile.isAdmin) {
            alert('Bu fonksiyonu kullanma yetkiniz yok!');
            return false;
        }

        return true;
    }

    /**
     * Bozuk sohbet verilerini temizler
     * @returns {Promise<Object>} - Temizleme sonucu
     */
    static async cleanupInvalidConversations() {
        try {
            if (!(await this.init())) return { success: false };

            // Sohbet koleksiyonunu kontrol et
            const conversationsRef = collection(firestore, 'conversations');
            const querySnapshot = await getDocs(conversationsRef);

            const results = {
                total: querySnapshot.size,
                fixed: 0,
                deleted: 0,
                noAction: 0,
                errors: [],
            };

            for (const doc of querySnapshot.docs) {
                try {
                    const conversationData = doc.data();

                    // Katılımcı dizisini kontrol edelim
                    const participants = conversationData.participants || [];

                    if (
                        participants.includes('undefined') ||
                        participants.includes(undefined)
                    ) {
                        // Bozuk bir sohbet bulundu, silelim
                        await deleteDoc(doc.ref);
                        results.deleted++;
                        console.log(`Bozuk sohbet silindi: ${doc.id}`);
                        continue;
                    }

                    // Katılımcıları kontrol edelim - her iki kullanıcının da gerçekten var olup olmadığını
                    let invalid = false;

                    for (const userId of participants) {
                        if (
                            !userId ||
                            userId === 'undefined' ||
                            userId === 'null'
                        ) {
                            invalid = true;
                            break;
                        }

                        // Kullanıcının gerçekten var olduğunu kontrol et
                        const userDoc = await getDoc(
                            doc(firestore, 'users', userId)
                        );
                        if (!userDoc.exists()) {
                            invalid = true;
                            break;
                        }
                    }

                    if (invalid) {
                        // Bozuk bir sohbet bulundu, silelim
                        await deleteDoc(doc.ref);
                        results.deleted++;
                        console.log(`Bozuk sohbet silindi: ${doc.id}`);
                    } else {
                        results.noAction++;
                    }
                } catch (error) {
                    console.error(
                        `Sohbet ID ${doc.id} işlenirken hata:`,
                        error
                    );
                    results.errors.push({
                        id: doc.id,
                        error: error.message,
                    });
                }
            }

            // Sonuçları konsolda göster
            console.log('Temizleme tamamlandı:', results);

            // Aynı zamanda sayfada alert olarak da gösterelim
            alert(`Temizleme tamamlandı:
                  - Toplam sohbet: ${results.total}
                  - Silinen: ${results.deleted}
                  - Hata: ${results.errors.length}`);

            return { success: true, results };
        } catch (error) {
            console.error('Temizleme hatası:', error);
            alert('Temizleme sırasında bir hata oluştu: ' + error.message);
            return { success: false, error: error.message };
        }
    }
}

export default DatabaseRepairTool;
