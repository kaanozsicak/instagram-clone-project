import { 
    collection, 
    doc, 
    setDoc, 
    deleteDoc, 
    query, 
    where, 
    getDocs 
  } from 'firebase/firestore';
  import { firestore } from './firebase-config.js';
  import { AuthService } from './auth-service.js';
  
  export class FollowService {
    static async followUser(followedUsername) {
      try {
        // Mevcut kullanıcıyı al
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
          throw new Error('Kullanıcı girişi yapılmamış');
        }
  
        // Takip edilecek kullanıcının bilgilerini al
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('username', '==', followedUsername.toLowerCase()));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          throw new Error('Kullanıcı bulunamadı');
        }
  
        const followedUserDoc = querySnapshot.docs[0];
        const followedUserId = followedUserDoc.id;
  
        // Takip belgesini oluştur
        const followRef = doc(collection(firestore, 'followers'));
        await setDoc(followRef, {
          followerUid: currentUser.uid,
          followedUid: followedUserId,
          followerUsername: currentUser.displayName || currentUser.email.split('@')[0],
          followedUsername: followedUsername,
          createdAt: new Date()
        });
  
        return true;
      } catch (error) {
        console.error('Takip hatası:', error);
        throw error;
      }
    }
  
    static async unfollowUser(followedUsername) {
      try {
        // Mevcut kullanıcıyı al
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
          throw new Error('Kullanıcı girişi yapılmamış');
        }
  
        // Takipten çıkarılacak kullanıcının bilgilerini al
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('username', '==', followedUsername.toLowerCase()));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          throw new Error('Kullanıcı bulunamadı');
        }
  
        const followedUserDoc = querySnapshot.docs[0];
        const followedUserId = followedUserDoc.id;
  
        // Takip belgesini bul ve sil
        const followersRef = collection(firestore, 'followers');
        const followQuery = query(
          followersRef, 
          where('followerUid', '==', currentUser.uid),
          where('followedUid', '==', followedUserId)
        );
  
        const followSnapshot = await getDocs(followQuery);
        
        if (!followSnapshot.empty) {
          const followDoc = followSnapshot.docs[0];
          await deleteDoc(doc(firestore, 'followers', followDoc.id));
        }
  
        return true;
      } catch (error) {
        console.error('Takipten çıkma hatası:', error);
        throw error;
      }
    }
  
    static async checkFollowStatus(followedUsername) {
      try {
        // Mevcut kullanıcıyı al
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
          return false;
        }
  
        // Takip edilecek kullanıcının bilgilerini al
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('username', '==', followedUsername.toLowerCase()));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          throw new Error('Kullanıcı bulunamadı');
        }
  
        const followedUserDoc = querySnapshot.docs[0];
        const followedUserId = followedUserDoc.id;
  
        // Takip durumunu kontrol et
        const followersRef = collection(firestore, 'followers');
        const followQuery = query(
          followersRef, 
          where('followerUid', '==', currentUser.uid),
          where('followedUid', '==', followedUserId)
        );
  
        const followSnapshot = await getDocs(followQuery);
        
        return !followSnapshot.empty;
      } catch (error) {
        console.error('Takip durumu kontrol hatası:', error);
        return false;
      }
    }
  
    static async getFollowersCount(username) {
      try {
        // Kullanıcının bilgilerini al
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('username', '==', username.toLowerCase()));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          throw new Error('Kullanıcı bulunamadı');
        }
  
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
  
        // Takipçi sayısını hesapla
        const followersRef = collection(firestore, 'followers');
        const followQuery = query(
          followersRef, 
          where('followedUid', '==', userId)
        );
  
        const followSnapshot = await getDocs(followQuery);
        
        return followSnapshot.size;
      } catch (error) {
        console.error('Takipçi sayısı alma hatası:', error);
        return 0;
      }
    }
  }