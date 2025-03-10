import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, firestore, storage } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export class AuthService {
    static async signup(email, password, additionalInfo = {}) {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            try {
                await this.saveUserAdditionalInfo(user.uid, {
                    email: user.email,
                    createdAt: new Date(),
                    isProfileComplete: false,
                    initialSignupCompleted: true,
                    followers: [],
                    following: [],
                    posts: [],
                    ...additionalInfo,
                });
            } catch (saveError) {
                console.error('Kullanıcı bilgileri kaydedilemedi:', saveError);

                await user.delete();

                throw saveError;
            }

            return user;
        } catch (error) {
            console.error('Kayıt hatası:', error);

            switch (error.code) {
                case 'auth/email-already-in-use':
                    throw new Error('Bu e-posta adresi zaten kullanımda');
                case 'auth/invalid-email':
                    throw new Error('Geçersiz e-posta adresi');
                case 'auth/weak-password':
                    throw new Error(
                        'Şifre çok zayıf. En az 6 karakter olmalı.'
                    );
                case 'permission-denied':
                    throw new Error('Kullanıcı oluşturma izniniz yok');
                default:
                    throw new Error('Kayıt sırasında bir hata oluştu');
            }
        }
    }

    static async saveUserAdditionalInfo(uid, userData) {
        try {
            const userRef = doc(firestore, 'users', uid);

            await setDoc(userRef, userData, {
                merge: true,
            });

            // Followers koleksiyonu için başlangıç dökümanı
            await setDoc(doc(firestore, 'followers', uid), {
                followers: [],
                following: [],
            });

            console.log('Kullanıcı bilgileri başarıyla kaydedildi');
        } catch (error) {
            console.error('Kullanıcı bilgileri kaydedilemedi:', error);

            if (
                error.code === 'permission-denied' ||
                error.message.includes('permission')
            ) {
                throw new Error(
                    "Firestore'a yazma izniniz yok. Lütfen Firebase ayarlarınızı kontrol edin."
                );
            }

            throw error;
        }
    }

    static async updateUserProfile(uid, profileData, profileImage = null) {
        try {
            const userRef = doc(firestore, 'users', uid);

            if (profileImage) {
                const imageRef = ref(
                    storage,
                    `profile_images/${uid}/${profileImage.name}`
                );
                const snapshot = await uploadBytes(imageRef, profileImage);
                const downloadURL = await getDownloadURL(snapshot.ref);

                profileData.profileImage = downloadURL;

                await updateProfile(auth.currentUser, {
                    photoURL: downloadURL,
                });
            }

            await setDoc(userRef, profileData, { merge: true });
            return true;
        } catch (error) {
            console.error('Profil güncellenemedi:', error);
            throw error;
        }
    }

    static async getUserProfile(uid) {
        try {
            const userRef = doc(firestore, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                const isProfileComplete = userData.isProfileComplete === true;

                return {
                    ...userData,
                    uid,
                    fullName: userData.fullName || '',
                    username: userData.username || '',
                    profileImage:
                        userData.profileImage || '/default-avatar.png',
                    bio: userData.bio || '',
                    isProfileComplete: isProfileComplete,
                    mustCompleteProfile: !isProfileComplete,
                };
            } else {
                return {
                    uid,
                    fullName: '',
                    username: '',
                    profileImage: '/default-avatar.png',
                    bio: '',
                    isProfileComplete: false,
                    mustCompleteProfile: true,
                };
            }
        } catch (error) {
            console.error('Profil alınamadı:', error);

            return {
                uid,
                fullName: '',
                username: '',
                profileImage: '/default-avatar.png',
                bio: '',
                isProfileComplete: false,
                mustCompleteProfile: true,
            };
        }
    }

    static async login(email, password) {
        try {
            console.log('Login başlatılıyor...');
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );
            const user = userCredential.user;

            if (!user) {
                throw new Error('Giriş başarısız');
            }

            // Son giriş zamanını güncelle
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, {
                lastLogin: new Date(),
            });

            console.log('Kullanıcı giriş yaptı:', user);
            return userCredential; // Direkt userCredential döndür
        } catch (error) {
            console.error('Login hatası:', error);

            // Hata mesajlarını özelleştir
            switch (error.code) {
                case 'auth/invalid-credential':
                    throw new Error('E-posta veya şifre hatalı');
                case 'auth/user-not-found':
                    throw new Error('Kullanıcı bulunamadı');
                case 'auth/wrong-password':
                    throw new Error('Yanlış şifre');
                case 'auth/too-many-requests':
                    throw new Error('Çok fazla başarısız giriş denemesi');
                default:
                    throw new Error(
                        error.message || 'Giriş sırasında bir hata oluştu'
                    );
            }
        }
    }

    static async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    username: user.email.split('@')[0].toLowerCase(),
                    fullName: user.displayName || '',
                    profileImage: user.photoURL || '',
                    bio: '',
                    followers: [],
                    following: [],
                    posts: [],
                    isProfileComplete: false,
                    initialSignupCompleted: true,
                    createdAt: new Date(),
                    lastLogin: new Date(),
                });

                await setDoc(doc(firestore, 'followers', user.uid), {
                    followers: [],
                    following: [],
                });
            }

            // Profil tamamlanmamışsa complete-profile sayfasına yönlendir
            const userProfile = await this.getUserProfile(user.uid);
            if (!userProfile.isProfileComplete) {
                window.location.href = '/complete-profile';
                return null;
            }

            return user;
        } catch (error) {
            console.error('Google girişi hatası:', error);

            switch (error.code) {
                case 'auth/account-exists-with-different-credential':
                    throw new Error(
                        'Bu e-posta adresi farklı bir hesapla zaten kayıtlı'
                    );
                case 'auth/popup-blocked':
                    throw new Error(
                        'Popup penceresi engellenmiş. Lütfen izin verin.'
                    );
                case 'auth/popup-closed-by-user':
                    throw new Error(
                        'Giriş işlemi kullanıcı tarafından iptal edildi'
                    );
                default:
                    throw new Error('Google girişi sırasında bir hata oluştu');
            }
        }
    }

    static async loginWithFacebook() {
        try {
            const provider = new FacebookAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    username: user.email.split('@')[0].toLowerCase(),
                    fullName: user.displayName || '',
                    profileImage: user.photoURL || '',
                    bio: '',
                    followers: [],
                    following: [],
                    posts: [],
                    isProfileComplete: false,
                    initialSignupCompleted: true,
                    createdAt: new Date(),
                    lastLogin: new Date(),
                });

                await setDoc(doc(firestore, 'followers', user.uid), {
                    followers: [],
                    following: [],
                });
            }

            // Profil tamamlanmamışsa complete-profile sayfasına yönlendir
            const userProfile = await this.getUserProfile(user.uid);
            if (!userProfile.isProfileComplete) {
                window.location.href = '/complete-profile';
                return null;
            }

            return user;
        } catch (error) {
            console.error('Facebook girişi hatası:', error);

            switch (error.code) {
                case 'auth/account-exists-with-different-credential':
                    throw new Error(
                        'Bu e-posta adresi farklı bir hesapla zaten kayıtlı'
                    );
                case 'auth/popup-blocked':
                    throw new Error(
                        'Popup penceresi engellenmiş. Lütfen izin verin.'
                    );
                case 'auth/popup-closed-by-user':
                    throw new Error(
                        'Giriş işlemi kullanıcı tarafından iptal edildi'
                    );
                default:
                    throw new Error(
                        'Facebook girişi sırasında bir hata oluştu'
                    );
            }
        }
    }

    static async logout() {
        try {
            await signOut(auth);
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
        } catch (error) {
            console.error('Çıkış yapılırken hata:', error);
            throw error;
        }
    }

    static onAuthStateChange(callback) {
        try {
            return onAuthStateChanged(auth, (user) => {
                console.log(
                    'Auth durumu değişti:',
                    user ? 'Kullanıcı var' : 'Kullanıcı yok'
                );
                callback(user);
            });
        } catch (error) {
            console.error('Auth state listener hatası:', error);
            callback(null);
            return () => {}; // Boş bir unsubscribe fonksiyonu
        }
    }

    static getCurrentUser() {
        try {
            const user = auth.currentUser;
            console.log('Current user:', user);
            return user;
        } catch (error) {
            console.error('getCurrentUser error:', error);
            return null;
        }
    }

    static async reloadCurrentUser() {
        const user = this.getCurrentUser();
        if (user) {
            try {
                await user.reload();
                console.log('Kullanıcı bilgileri yenilendi:', user);
                return user;
            } catch (error) {
                console.error('Kullanıcı yenileme hatası:', error);
                return null;
            }
        }
        return null;
    }

    static async ensureCurrentUser() {
        return new Promise((resolve) => {
            const unsubscribe = this.onAuthStateChange((user) => {
                unsubscribe();
                if (user) {
                    user.reload()
                        .then(() => resolve(user))
                        .catch(() => resolve(null));
                } else {
                    resolve(null);
                }
            });
        });
    }

    static async checkUsernameAvailability(username) {
        try {
            if (!username || username.trim().length < 3) {
                throw new Error('Kullanıcı adı en az 3 karakter olmalıdır');
            }

            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(username.trim())) {
                throw new Error(
                    'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'
                );
            }

            const usersRef = collection(firestore, 'users');
            const q = query(
                usersRef,
                where('username', '==', username.trim().toLowerCase())
            );

            try {
                const querySnapshot = await getDocs(q);
                return querySnapshot.empty;
            } catch (firestoreError) {
                console.error('Firestore sorgu hatası:', firestoreError);

                if (firestoreError.message.includes('Null value')) {
                    console.warn(
                        'Firestore sorgu hatası, kullanıcı adı kontrolü atlandı'
                    );
                    return true;
                }

                throw firestoreError;
            }
        } catch (error) {
            console.error('Kullanıcı adı kontrolünde hata:', error);
            throw error;
        }
    }

    static async followUser(targetUserId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            const currentUserFollowersRef = doc(
                firestore,
                'followers',
                currentUser.uid
            );
            const targetUserFollowersRef = doc(
                firestore,
                'followers',
                targetUserId
            );

            // Mevcut kullanıcının takip ettiklerini güncelle
            await updateDoc(currentUserFollowersRef, {
                following: arrayUnion(targetUserId),
            });

            // Hedef kullanıcının takipçilerini güncelle
            await updateDoc(targetUserFollowersRef, {
                followers: arrayUnion(currentUser.uid),
            });

            return true;
        } catch (error) {
            console.error('Kullanıcı takip hatası:', error);
            throw error;
        }
    }

    static async unfollowUser(targetUserId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            const currentUserFollowersRef = doc(
                firestore,
                'followers',
                currentUser.uid
            );
            const targetUserFollowersRef = doc(
                firestore,
                'followers',
                targetUserId
            );

            // Mevcut kullanıcının takip ettiklerinden çıkar
            await updateDoc(currentUserFollowersRef, {
                following: arrayRemove(targetUserId),
            });

            // Hedef kullanıcının takipçilerinden çıkar
            await updateDoc(targetUserFollowersRef, {
                followers: arrayRemove(currentUser.uid),
            });

            return true;
        } catch (error) {
            console.error('Kullanıcı takipten çıkarma hatası:', error);
            throw error;
        }
    }
}

export default AuthService;
