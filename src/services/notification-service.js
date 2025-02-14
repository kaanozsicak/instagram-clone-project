import { firestore } from './firebase-config.js';
import { FollowService } from './follow-service.js'; // Yeni import
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    setDoc,
} from 'firebase/firestore';

export class NotificationService {
    static async sendFollowRequest(
        targetUserId,
        senderUserId,
        senderUsername,
        targetUsername
    ) {
        try {
            if (!targetUserId || !senderUserId || !senderUsername) {
                throw new Error('Gerekli bilgiler eksik');
            }

            // Önce mevcut isteği kontrol et
            const existingRequest = await this.checkExistingRequest(
                targetUserId,
                senderUserId
            );
            if (existingRequest) {
                console.log('Zaten bekleyen bir istek var');
                return true;
            }

            const notificationsRef = collection(firestore, 'notifications');
            const notification = {
                type: 'follow_request',
                targetUserId,
                senderUserId,
                senderUsername,
                targetUsername,
                status: 'pending',
                createdAt: new Date().toISOString(),
            };

            console.log('Yeni takip isteği gönderiliyor:', notification);
            const docRef = await addDoc(notificationsRef, notification);
            console.log('Takip isteği döküman ID:', docRef.id);

            // Takip isteğini ayrıca followRequests koleksiyonuna da kaydet
            const followRequestRef = doc(
                firestore,
                'followRequests',
                `${senderUserId}_${targetUserId}`
            );
            await setDoc(followRequestRef, {
                ...notification,
                id: docRef.id,
            });

            return true;
        } catch (error) {
            console.error('Takip isteği gönderme hatası:', error);
            throw error;
        }
    }

    static async checkExistingRequest(targetUserId, senderUserId) {
        try {
            const notificationsRef = collection(firestore, 'notifications');
            const q = query(
                notificationsRef,
                where('targetUserId', '==', targetUserId),
                where('senderUserId', '==', senderUserId),
                where('status', '==', 'pending')
            );

            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('İstek kontrolü hatası:', error);
            return false;
        }
    }

    static async sendFollowNotification(targetUserId, followerUsername) {
        try {
            if (!targetUserId || !followerUsername) {
                throw new Error('Gerekli bilgiler eksik');
            }

            const notificationsRef = collection(firestore, 'notifications');
            const notification = {
                type: 'new_follower',
                targetUserId,
                followerUsername,
                createdAt: new Date().toISOString(),
                isRead: false,
            };

            console.log('Gönderilecek bildirim:', notification);
            await addDoc(notificationsRef, notification);
        } catch (error) {
            console.error('Takip bildirimi gönderme hatası:', error);
            throw error;
        }
    }

    static async getPendingFollowRequests(userId) {
        try {
            const notificationsRef = collection(firestore, 'notifications');
            const q = query(
                notificationsRef,
                where('targetUserId', '==', userId),
                where('type', '==', 'follow_request'),
                where('status', '==', 'pending'),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error('Takip istekleri alma hatası:', error);
            return [];
        }
    }

    static async getNotifications(userId) {
        try {
            const notificationsRef = collection(firestore, 'notifications');

            // Önce basic sorgu yap
            const basicQuery = query(
                notificationsRef,
                where('targetUserId', '==', userId),
                where('status', '==', 'pending'),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(basicQuery);
            const notifications = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            console.log('Bildirimler yüklendi:', notifications);
            return notifications;
        } catch (error) {
            console.error('Bildirimler alınırken hata:', error);
            return [];
        }
    }

    static async handleFollowRequest(
        notificationId,
        isAccepted,
        targetUserId,
        senderUserId
    ) {
        try {
            console.log('Takip isteği işleniyor:', {
                notificationId,
                isAccepted,
                targetUserId,
                senderUserId,
            });

            const notificationRef = doc(
                firestore,
                'notifications',
                notificationId
            );
            const followRequestRef = doc(
                firestore,
                'followRequests',
                `${senderUserId}_${targetUserId}`
            );

            if (isAccepted) {
                // Takip isteğini kabul et
                await FollowService.addFollower(senderUserId, targetUserId);
                await updateDoc(notificationRef, { status: 'accepted' });
                await updateDoc(followRequestRef, { status: 'accepted' });
            } else {
                // Takip isteğini reddet
                await updateDoc(notificationRef, { status: 'rejected' });
                await updateDoc(followRequestRef, { status: 'rejected' });
            }

            console.log(
                'Takip isteği işlendi:',
                isAccepted ? 'Kabul edildi' : 'Reddedildi'
            );
            return true;
        } catch (error) {
            console.error('Takip isteği işlenirken hata:', error);
            throw error;
        }
    }
}

export default NotificationService;
