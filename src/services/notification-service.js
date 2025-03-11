import { firestore } from './firebase-config.js';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { AuthService } from './auth-service.js';
import { FollowService } from './follow-service.js';

export class NotificationService {
    /**
     * Kullanıcının bildirimlerini getirir
     * @param {string} userId - Bildirimleri alınacak kullanıcının ID'si
     * @returns {Promise<Array>} - Bildirimlerin listesi
     */
    static async getNotifications(userId) {
        try {
            const notificationsRef = collection(firestore, 'notifications');
            const q = query(
                notificationsRef,
                where('recipientId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt,
            }));
        } catch (error) {
            console.error('Bildirimler alınırken hata:', error);
            return [];
        }
    }

    /**
     * Yeni bir bildirim oluşturur
     * @param {Object} notificationData - Bildirim verileri
     * @returns {Promise<string>} - Oluşturulan bildirimin ID'si
     */
    static async createNotification(notificationData) {
        try {
            const notificationWithTimestamp = {
                ...notificationData,
                isRead: false,
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(
                collection(firestore, 'notifications'),
                notificationWithTimestamp
            );

            return docRef.id;
        } catch (error) {
            console.error('Bildirim oluşturulurken hata:', error);
            throw error;
        }
    }

    /**
     * Takip isteğini işler (kabul veya red)
     * @param {string} notificationId - Bildirim ID'si
     * @param {boolean} isAccepted - Kabul edildi mi
     * @param {string} currentUserId - Mevcut kullanıcı ID'si
     * @param {string} requesterId - İstek gönderen kullanıcı ID'si
     * @returns {Promise<boolean>} - İşlem başarılı mı
     */
    static async handleFollowRequest(
        notificationId,
        isAccepted,
        currentUserId,
        requesterId
    ) {
        try {
            // Bildirim durumunu güncelle
            const notificationRef = doc(
                firestore,
                'notifications',
                notificationId
            );
            await updateDoc(notificationRef, {
                status: isAccepted ? 'completed' : 'rejected',
                isRead: true,
            });

            // İstek kabul edildi ise, takip işlemini gerçekleştir
            if (isAccepted) {
                await FollowService.directFollow(requesterId, currentUserId);

                // Kabul bildirimi oluştur
                await this.createNotification({
                    type: 'follow_accepted',
                    recipientId: requesterId,
                    senderUserId: currentUserId,
                    senderUsername: await this.getUsernameFromId(currentUserId),
                    content: 'takip isteğinizi kabul etti',
                    createdAt: new Date(),
                });
            }

            return true;
        } catch (error) {
            console.error('Takip isteği işlenirken hata:', error);
            throw error;
        }
    }

    /**
     * Kullanıcı ID'sinden kullanıcı adı getirir
     * @param {string} userId - Kullanıcı ID'si
     * @returns {Promise<string>} - Kullanıcı adı
     */
    static async getUsernameFromId(userId) {
        try {
            const userDoc = await AuthService.getUserProfile(userId);
            return userDoc?.username || 'Kullanıcı';
        } catch (error) {
            console.error('Kullanıcı adı alınırken hata:', error);
            return 'Kullanıcı';
        }
    }

    /**
     * Tüm bildirimleri okundu olarak işaretler
     * @param {string} userId - Bildirim sahibinin kullanıcı ID'si
     * @returns {Promise<boolean>} - İşlem başarılı mı
     */
    static async markAllAsRead(userId) {
        try {
            const notificationsRef = collection(firestore, 'notifications');
            const q = query(
                notificationsRef,
                where('recipientId', '==', userId),
                where('isRead', '==', false)
            );

            const querySnapshot = await getDocs(q);

            // Eğer okunmamış bildirim yoksa işlem yapma
            if (querySnapshot.empty) {
                return true;
            }

            // Tüm bildirimleri okundu olarak işaretle
            const updatePromises = querySnapshot.docs.map((doc) => {
                return updateDoc(doc.ref, { isRead: true });
            });

            await Promise.all(updatePromises);
            return true;
        } catch (error) {
            console.error(
                'Bildirimler okundu olarak işaretlenirken hata:',
                error
            );
            return false;
        }
    }
}

export default NotificationService;
