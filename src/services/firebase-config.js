import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Auth'u başlat
const auth = getAuth(app);

// Firestore'u yeni cache yapılandırmasıyla başlat
const firestore = initializeFirestore(app, {
    cache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
    }),
});

// Storage'ı başlat
const storage = getStorage(app);

export { auth, firestore, storage };
