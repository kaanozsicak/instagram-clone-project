import { signOut } from 'firebase/auth';
import { auth } from './firebase-config.js';

export class AuthService {
    static async logout() {
        try {
            // Firebase oturumunu kapat
            await signOut(auth);

            // Storage'ları temizle
            localStorage.clear();
            sessionStorage.clear();

            // Login sayfasına yönlendir
            window.location.href = '/login';
        } catch (error) {
            console.error('Çıkış yapılırken hata:', error);
            throw error;
        }
    }
}

export default AuthService;
