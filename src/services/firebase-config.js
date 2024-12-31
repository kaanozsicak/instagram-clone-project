import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence,
  setPersistence,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { 
  getStorage 
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Authentication'ı başlat
const auth = getAuth(app);

// Firestore'u başlat
const firestore = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Firestore için IndexedDB kalıcılığını etkinleştir
enableIndexedDbPersistence(firestore)
  .catch((error) => {
    console.error('Firestore kalıcılık hatası:', error);
  });

// Storage'ı başlat
const storage = getStorage(app);

// Sosyal medya sağlayıcıları
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Kalıcılık ayarını yap
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Kalıcılık ayarlandı');
  })
  .catch((error) => {
    console.error('Kalıcılık ayarlanamadı:', error);
  });

// Sosyal medya girişi için izinleri ayarla
googleProvider.setCustomParameters({
  'prompt': 'select_account'
});

facebookProvider.setCustomParameters({
  'display': 'popup'
});

export { 
  app, 
  auth, 
  firestore, 
  storage,
  googleProvider,
  facebookProvider
};