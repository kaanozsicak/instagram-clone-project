import { firestore } from './firebase-config.js';
import {
    doc,
    getDoc,
    updateDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    arrayUnion,
    arrayRemove,
} from 'firebase/firestore';
import { AuthService } from './auth-service.js';

export class FollowService {
    static async followUser(username) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // Takip edilecek kullanıcıyı bul
            const targetUser = await this.getUserByUsername(username);
            if (!targetUser) {
                throw new Error('Kullanıcı bulunamadı');
            }

            // Kendinizi takip etmeye çalışıyorsanız
            if (targetUser.uid === currentUser.uid) {
                throw new Error('Kendinizi takip edemezsiniz');
            }

            // Kullanıcının gizlilik ayarlarını kontrol et
            const isPrivate = targetUser.isPrivate || false;

            // Bildirim servisini dinamik olarak import et
            const NotificationService = await import(
                '../services/notification-service.js'
            ).then((module) => module.default || module.NotificationService);

            // Eğer kullanıcı gizli hesap ise takip isteği gönder
            if (isPrivate) {
                console.log('Gizli hesap için takip isteği gönderiliyor');

                // Takip isteği bildirimini oluştur - sendFollowRequest yerine createNotification kullan
                await NotificationService.createNotification({
                    type: 'follow_request',
                    status: 'pending',
                    recipientId: targetUser.uid,
                    senderUserId: currentUser.uid,
                    senderUsername: await this.getCurrentUsername(),
                    content: 'sizi takip etmek istiyor',
                    createdAt: new Date(),
                });

                console.log(
                    'Takip isteği gönderildi, "pending" durumu döndürülüyor'
                );
                return 'pending';
            }

            // Gizli hesap değilse direkt takip et
            await this.directFollow(currentUser.uid, targetUser.uid);

            console.log('Kullanıcı başarıyla takip edildi');
            return true;
        } catch (error) {
            console.error('Kullanıcı takip hatası:', error);
            throw error;
        }
    }

    static async directFollow(followerUid, followedUid) {
        try {
            // Takip eden kullanıcının takip listesine ekle
            const followerRef = doc(firestore, 'followers', followerUid);
            const followerDoc = await getDoc(followerRef);

            if (!followerDoc.exists()) {
                await setDoc(followerRef, { following: [followedUid] });
            } else {
                const followerData = followerDoc.data();
                const following = Array.isArray(followerData.following)
                    ? [...followerData.following]
                    : [];

                // Zaten takip ediliyorsa return
                if (following.includes(followedUid)) {
                    return;
                }

                following.push(followedUid);
                await updateDoc(followerRef, { following });
            }

            // Takip edilen kullanıcının takipçi listesine ekle
            const followedRef = doc(firestore, 'followers', followedUid);
            const followedDoc = await getDoc(followedRef);

            if (!followedDoc.exists()) {
                await setDoc(followedRef, { followers: [followerUid] });
            } else {
                const followedData = followedDoc.data();
                const followers = Array.isArray(followedData.followers)
                    ? [...followedData.followers]
                    : [];

                if (!followers.includes(followerUid)) {
                    followers.push(followerUid);
                    await updateDoc(followedRef, { followers });
                }
            }

            // Takip etme bildirimi gönder (istek değil)
            const currentUsername = await this.getCurrentUsername();

            // Bildirim servisini dinamik olarak import et
            const NotificationService = await import(
                '../services/notification-service.js'
            ).then((module) => module.default || module.NotificationService);

            await NotificationService.createNotification({
                type: 'follow',
                status: 'completed',
                senderUserId: followerUid,
                senderUsername: currentUsername,
                receiverUserId: followedUid,
                content: `${currentUsername} sizi takip etmeye başladı`,
            });

            return true;
        } catch (error) {
            console.error('Direkt takip hatası:', error);
            throw error;
        }
    }

    static async unfollowUser(username) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) throw new Error('Kullanıcı oturumu açık değil');

            // Hedef kullanıcının ID'sini bul
            const usersRef = collection(firestore, 'users');
            const q = query(
                usersRef,
                where('username', '==', username.toLowerCase())
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error('Kullanıcı bulunamadı');
            }

            const targetUserId = querySnapshot.docs[0].id;

            // Takipten çıkar
            const followingRef = doc(firestore, 'followers', currentUser.uid);
            await updateDoc(followingRef, {
                following: arrayRemove(targetUserId),
            });

            const followersRef = doc(firestore, 'followers', targetUserId);
            await updateDoc(followersRef, {
                followers: arrayRemove(currentUser.uid),
            });

            console.log(`${username} kullanıcısı takipten çıkarıldı`);
            return true;
        } catch (error) {
            console.error('Takipten çıkarma hatası:', error);
            throw error;
        }
    }

    static async getUserByUsername(username) {
        try {
            const usersRef = collection(firestore, 'users');
            const q = query(
                usersRef,
                where('username', '==', username.toLowerCase())
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            const userDoc = querySnapshot.docs[0];
            return {
                uid: userDoc.id,
                ...userDoc.data(),
            };
        } catch (error) {
            console.error('Kullanıcı arama hatası:', error);
            throw error;
        }
    }

    static async getCurrentUsername() {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) return 'Kullanıcı';

            const userProfile = await AuthService.getUserProfile(
                currentUser.uid
            );
            return (
                userProfile?.username || currentUser.displayName || 'Kullanıcı'
            );
        } catch (error) {
            console.error('Kullanıcı adı alma hatası:', error);
            return 'Kullanıcı';
        }
    }

    static async checkFollowRequestStatus(username) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // Takip edilecek kullanıcıyı bul
            const targetUser = await this.getUserByUsername(username);
            if (!targetUser) {
                throw new Error('Kullanıcı bulunamadı');
            }

            // Takip durumunu kontrol et
            const followerRef = doc(firestore, 'followers', currentUser.uid);
            const followerDoc = await getDoc(followerRef);

            let isFollowing = false;
            if (followerDoc.exists()) {
                const followerData = followerDoc.data();
                const following = Array.isArray(followerData.following)
                    ? followerData.following
                    : [];
                isFollowing = following.includes(targetUser.uid);
            }

            // Bildirimler koleksiyonunda bekleyen takip isteği var mı kontrol et
            const notificationsRef = collection(firestore, 'notifications');
            const q = query(
                notificationsRef,
                where('type', '==', 'follow_request'),
                where('senderUserId', '==', currentUser.uid),
                where('receiverUserId', '==', targetUser.uid),
                where('status', '==', 'pending')
            );

            const querySnapshot = await getDocs(q);
            const isPending = !querySnapshot.empty;

            return {
                isFollowing,
                isPending,
            };
        } catch (error) {
            console.error('Takip durumu kontrolü hatası:', error);
            return {
                isFollowing: false,
                isPending: false,
            };
        }
    }

    static async getFollowersCount(username) {
        try {
            const targetUser = await this.getUserByUsername(username);
            if (!targetUser) {
                throw new Error('Kullanıcı bulunamadı');
            }

            const followersRef = doc(firestore, 'followers', targetUser.uid);
            const followersDoc = await getDoc(followersRef);

            if (!followersDoc.exists()) {
                return 0;
            }

            const followersData = followersDoc.data();
            return Array.isArray(followersData.followers)
                ? followersData.followers.length
                : 0;
        } catch (error) {
            console.error('Takipçi sayısı alma hatası:', error);
            return 0;
        }
    }

    /**
     * Kullanıcının takip ettiği kişilerin listesini getirir
     * @param {string} userId - Kullanıcı ID'si
     * @returns {Promise<Array>} - Takip edilen kullanıcı ID'leri
     */
    static async getFollowing(userId) {
        try {
            const followersDoc = await getDoc(
                doc(firestore, 'followers', userId)
            );
            if (!followersDoc.exists()) {
                return [];
            }

            return followersDoc.data().following || [];
        } catch (error) {
            console.error('Takip edilenler listesi getirme hatası:', error);
            return [];
        }
    }

    /**
     * Kullanıcının takipçilerinin listesini getirir
     * @param {string} userId - Kullanıcı ID'si
     * @returns {Promise<Array>} - Takipçi kullanıcı ID'leri
     */
    static async getFollowers(userId) {
        try {
            const followersDoc = await getDoc(
                doc(firestore, 'followers', userId)
            );
            if (!followersDoc.exists()) {
                return [];
            }

            return followersDoc.data().followers || [];
        } catch (error) {
            console.error('Takipçiler listesi getirme hatası:', error);
            return [];
        }
    }

    /**
     * Kullanıcının bekleyen takip isteklerini getirir
     * @param {string} userId - Kullanıcı ID'si
     * @returns {Promise<Array>} - Bekleyen takip istekleri ID'leri
     */
    static async getPendingFollowRequests(userId) {
        try {
            const followersDoc = await getDoc(
                doc(firestore, 'followers', userId)
            );
            if (!followersDoc.exists()) {
                return [];
            }

            return followersDoc.data().pendingRequests || [];
        } catch (error) {
            console.error('Bekleyen takip istekleri getirme hatası:', error);
            return [];
        }
    }

    /**
     * İki kullanıcı arasındaki ilişkiyi kontrol eder
     * @param {string} userId1 - Birinci kullanıcı ID'si
     * @param {string} userId2 - İkinci kullanıcı ID'si
     * @returns {Promise<Object>} - Takip ilişkisi durumu
     */
    static async getRelationship(userId1, userId2) {
        try {
            // Takip edip etmediğini kontrol et
            const following = await this.getFollowing(userId1);
            const isFollowing = following.includes(userId2);

            // Takipçisi olup olmadığını kontrol et
            const followers = await this.getFollowers(userId2);
            const isFollower = followers.includes(userId1);

            const relationship = {
                isFollowing,
                isFollower,
            };

            const pendingFollowRequests = await this.getPendingFollowRequests(
                userId2
            );
            if (pendingFollowRequests.includes(userId1)) {
                relationship.isPending = true;
            } else {
                relationship.isPending = false;
            }

            return relationship;
        } catch (error) {
            console.error('İlişki kontrolü hatası:', error);
            return {
                isFollowing: false,
                isFollower: false,
                isPending: false,
            };
        }
    }
}

export default FollowService;
