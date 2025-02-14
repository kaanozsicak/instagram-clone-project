import { firestore } from './firebase-config.js';
import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    setDoc,
    collection,
    query,
    where,
    getDocs,
} from 'firebase/firestore';
import { AuthService } from './auth-service.js';
import { NotificationService } from './notification-service.js';

export class FollowService {
    static async getUserByUsername(username) {
        try {
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('username', '==', username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error('Kullanıcı bulunamadı');
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

    static async addFollower(currentUserId, targetUserId) {
        try {
            // Followers koleksiyonunda ilgili dökümanları al/oluştur
            const followingRef = doc(firestore, 'followers', currentUserId);
            const followersRef = doc(firestore, 'followers', targetUserId);

            // Following ve followers belgelerini kontrol et ve güncelle
            await setDoc(
                followingRef,
                {
                    following: arrayUnion(targetUserId),
                },
                { merge: true }
            );

            await setDoc(
                followersRef,
                {
                    followers: arrayUnion(currentUserId),
                },
                { merge: true }
            );

            return true;
        } catch (error) {
            console.error('Takipçi ekleme hatası:', error);
            throw error;
        }
    }

    static async followUser(targetUsername) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) throw new Error('Kullanıcı oturumu açık değil');

            // Hedef kullanıcının bilgilerini al
            const targetUser = await this.getUserByUsername(targetUsername);

            // Mevcut kullanıcının profilini al
            const currentUserProfile = await AuthService.getUserProfile(
                currentUser.uid
            );

            // Eğer hedef hesap gizliyse
            if (targetUser.isPrivate) {
                // Bildirim gönder
                await NotificationService.sendFollowRequest(
                    targetUser.uid, // Hedef kullanıcının ID'si
                    currentUser.uid, // İstek gönderen kullanıcının ID'si
                    currentUserProfile.username, // İstek gönderen kullanıcının adı
                    targetUser.username // Hedef kullanıcının adı
                );

                return 'pending';
            } else {
                // Gizli değilse direkt takip et
                await this.addFollower(currentUser.uid, targetUser.uid);
                return 'following';
            }
        } catch (error) {
            console.error('Takip isteği gönderme hatası:', error);
            throw error;
        }
    }

    static async getFollowing(userId) {
        try {
            const followingRef = doc(firestore, 'followers', userId);
            const followingDoc = await getDoc(followingRef);

            if (!followingDoc.exists()) {
                console.log('Takip edilen kullanıcı bulunamadı');
                return [];
            }

            const following = followingDoc.data().following || [];
            console.log('Takip edilen kullanıcılar:', following);
            return following;
        } catch (error) {
            console.error('Takip listesi alma hatası:', error);
            return [];
        }
    }

    static async checkFollowStatus(username) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) return false;

            // Hedef kullanıcının uid'sini bul
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('username', '==', username));
            const userSnapshot = await getDocs(q);

            if (userSnapshot.empty) {
                console.error('Kullanıcı bulunamadı:', username);
                return false;
            }

            const targetUserId = userSnapshot.docs[0].id;

            // Takip durumunu kontrol et
            const followingRef = doc(firestore, 'followers', currentUser.uid);
            const followingDoc = await getDoc(followingRef);

            if (!followingDoc.exists()) {
                return false;
            }

            const following = followingDoc.data().following || [];
            return following.includes(targetUserId);
        } catch (error) {
            console.error('Takip durumu kontrol hatası:', error);
            return false;
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

    static async getFollowersCount(username) {
        try {
            // Önce kullanıcının uid'sini bul
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('username', '==', username));
            const userSnapshot = await getDocs(q);

            if (userSnapshot.empty) {
                console.error('Kullanıcı bulunamadı:', username);
                return 0;
            }

            const userId = userSnapshot.docs[0].id;

            // Followers belgesini al
            const followersRef = doc(firestore, 'followers', userId);
            const followersDoc = await getDoc(followersRef);

            if (!followersDoc.exists()) {
                return 0;
            }

            // Followers dizisinin uzunluğunu döndür
            const followers = followersDoc.data().followers || [];
            return followers.length;
        } catch (error) {
            console.error('Takipçi sayısı alma hatası:', error);
            return 0;
        }
    }

    static async checkFollowRequestStatus(targetUsername) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) return { isFollowing: false, isPending: false };

            // Hedef kullanıcıyı bul
            const targetUser = await this.getUserByUsername(targetUsername);

            // Takip durumunu kontrol et
            const isFollowing = await this.checkFollowStatus(targetUsername);

            // Bekleyen istek durumunu kontrol et
            const notifications = await NotificationService.getNotifications(
                targetUser.uid
            );
            const hasPendingRequest = notifications.some(
                (n) =>
                    n.type === 'follow_request' &&
                    n.status === 'pending' &&
                    n.senderUserId === currentUser.uid
            );

            return {
                isFollowing,
                isPending: hasPendingRequest,
            };
        } catch (error) {
            console.error('Takip durumu kontrolü hatası:', error);
            return { isFollowing: false, isPending: false };
        }
    }

    static async saveFollowRequest(senderId, targetId) {
        try {
            const followRequestsRef = doc(
                firestore,
                'followRequests',
                `${senderId}_${targetId}`
            );
            await setDoc(followRequestsRef, {
                senderId,
                targetId,
                status: 'pending',
                createdAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Takip isteği kaydetme hatası:', error);
            throw error;
        }
    }
}

export default FollowService;
