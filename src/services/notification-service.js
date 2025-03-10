import { firestore } from './firebase-config.js';
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    limit,
} from 'firebase/firestore';

export class NotificationService {
    static async getNotifications(userId, limitCount = 10) {
        try {
            const notificationsRef = collection(firestore, 'notifications');

            // Basit bir sorgu kullanarak index sorununu çözelim
            // Gelen hatada Firestore, createdAt ile birlikte indeks oluşturmamızı istediği için
            // şimdilik sadece receiverUserId ile filtreleme yapalım
            const q = query(
                notificationsRef,
                where('receiverUserId', '==', userId),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);

            // Bildirimleri döndür
            const notifications = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                // Eğer createdAt varsa ve bir timestamp ise onayla, yoksa şimdiki zamanı kullan
                createdAt: doc.data().createdAt || Timestamp.now(),
            }));

            // Bellek içinde sıralama yapalım
            notifications.sort((a, b) => {
                // Timestamp nesnelerini karşılaştırma
                const dateA = a.createdAt?.toMillis
                    ? a.createdAt.toMillis()
                    : 0;
                const dateB = b.createdAt?.toMillis
                    ? b.createdAt.toMillis()
                    : 0;
                return dateB - dateA; // Azalan sıralama (en yeni ilk)
            });

            return notifications;
        } catch (error) {
            console.error('Bildirimler alınırken hata:', error);
            return [];
        }
    }

    static async createNotification(notification) {
        try {
            const notificationsRef = collection(firestore, 'notifications');

            // Bildirime tarih ekle
            notification.createdAt = serverTimestamp();
            notification.isRead = false;

            // Bildirimi Firestore'a ekle
            const docRef = await addDoc(notificationsRef, notification);

            return {
                id: docRef.id,
                ...notification,
            };
        } catch (error) {
            console.error('Bildirim oluşturulurken hata:', error);
            throw error;
        }
    }

    static async markAsRead(notificationId) {
        try {
            const notificationRef = doc(
                firestore,
                'notifications',
                notificationId
            );

            await updateDoc(notificationRef, {
                isRead: true,
                readAt: serverTimestamp(),
            });

            return true;
        } catch (error) {
            console.error('Bildirim okundu olarak işaretlenirken hata:', error);
            return false;
        }
    }

    static async handleFollowRequest(
        notificationId,
        isAccepted,
        receiverUserId,
        senderUserId
    ) {
        try {
            // Bildirimi güncelle
            const notificationRef = doc(
                firestore,
                'notifications',
                notificationId
            );
            await updateDoc(notificationRef, {
                status: isAccepted ? 'accepted' : 'rejected',
                isRead: true,
                updatedAt: serverTimestamp(),
            });

            if (isAccepted) {
                // Follow işlemini gerçekleştir
                const receiverFollowersRef = doc(
                    firestore,
                    'followers',
                    receiverUserId
                );
                const senderFollowingRef = doc(
                    firestore,
                    'followers',
                    senderUserId
                );

                // Alıcının takipçilerine gönderen kullanıcıyı ekle
                const receiverDoc = await getDoc(receiverFollowersRef);
                if (receiverDoc.exists()) {
                    const receiverData = receiverDoc.data();
                    const followers = Array.isArray(receiverData.followers)
                        ? receiverData.followers
                        : [];

                    if (!followers.includes(senderUserId)) {
                        followers.push(senderUserId);
                        await updateDoc(receiverFollowersRef, { followers });
                    }
                }

                // Gönderenin takip ettiklerine alıcıyı ekle
                const senderDoc = await getDoc(senderFollowingRef);
                if (senderDoc.exists()) {
                    const senderData = senderDoc.data();
                    const following = Array.isArray(senderData.following)
                        ? senderData.following
                        : [];

                    if (!following.includes(receiverUserId)) {
                        following.push(receiverUserId);
                        await updateDoc(senderFollowingRef, { following });
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Takip isteği işlenirken hata:', error);
            throw error;
        }
    }

    static async sendFollowRequest(
        senderUserId,
        senderUsername,
        receiverUserId
    ) {
        try {
            return await this.createNotification({
                type: 'follow_request',
                status: 'pending',
                senderUserId,
                senderUsername,
                receiverUserId,
                content: `${senderUsername} sizi takip etmek istiyor`,
            });
        } catch (error) {
            console.error('Takip isteği gönderilirken hata:', error);
            throw error;
        }
    }

    static async sendLikeNotification(
        senderUserId,
        senderUsername,
        receiverUserId,
        postId
    ) {
        // Alıcı ve gönderen aynı kişi ise bildirim gönderme
        if (senderUserId === receiverUserId) return null;

        try {
            return await this.createNotification({
                type: 'like',
                senderUserId,
                senderUsername,
                receiverUserId,
                postId,
                content: `${senderUsername} gönderini beğendi`,
            });
        } catch (error) {
            console.error('Beğeni bildirimi gönderilirken hata:', error);
            // Hata olsa bile akışı bozma
            return null;
        }
    }

    static async sendCommentNotification(
        senderUserId,
        senderUsername,
        receiverUserId,
        postId,
        commentText
    ) {
        // Alıcı ve gönderen aynı kişi ise bildirim gönderme
        if (senderUserId === receiverUserId) return null;

        try {
            return await this.createNotification({
                type: 'comment',
                senderUserId,
                senderUsername,
                receiverUserId,
                postId,
                commentText,
                content: `${senderUsername} gönderine yorum yaptı: "${commentText.substring(
                    0,
                    50
                )}${commentText.length > 50 ? '...' : ''}"`,
            });
        } catch (error) {
            console.error('Yorum bildirimi gönderilirken hata:', error);
            // Hata olsa bile akışı bozma
            return null;
        }
    }
}

export default NotificationService;
