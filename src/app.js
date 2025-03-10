import LoginPage from './pages/login.js';
import SignupPage from './pages/signup.js';
import HomePage from './pages/home.js';
import CompleteProfilePage from './pages/complete-profile.js';
import ProfilePage from './pages/profile.js';
import { AuthService } from './services/auth-service.js';

class App {
    constructor() {
        this.isAuthInitialized = false;
        this.currentUser = null;

        this.routes = {
            '/': HomePage,
            '/home': HomePage,
            '/login': LoginPage,
            '/signup': SignupPage,
            '/complete-profile': CompleteProfilePage,
            '/profile': ProfilePage,
        };

        this.init();
    }

    async init() {
        console.log('App başlatılıyor');

        try {
            // Auth durumunu dinle ve authInitialized'ı güncelle
            this.authUnsubscribe = AuthService.onAuthStateChange((user) => {
                console.log(
                    'Auth değişikliği algılandı:',
                    user ? 'Oturum açık' : 'Oturum kapalı'
                );
                this.currentUser = user;

                // İlk kez auth başlatıldığında routing yapalım
                if (!this.isAuthInitialized) {
                    this.isAuthInitialized = true;
                    this.handleInitialRouting();
                } else if (user) {
                    // Kullanıcı giriş yaptığında profil kontrolü yap
                    this.checkUserProfileAndRedirect(user);
                }
            });

            // Popstate event'ini handle et (geri butonu vs)
            window.addEventListener('popstate', () => {
                this.handleRouting();
            });
        } catch (error) {
            console.error('App initialization error:', error);
        }
    }

    async handleInitialRouting() {
        const path = window.location.pathname;
        console.log('İlk routing başlatılıyor:', path);

        // Login veya signup sayfalarından birine bakıyorsak ve kullanıcı login olduysa
        if (this.currentUser && (path === '/login' || path === '/signup')) {
            console.log('Kullanıcı oturumu açık, ana sayfaya yönlendiriliyor');
            window.location.href = '/home';
            return;
        }

        // Protected route'larda kullanıcı login değilse
        if (!this.currentUser && path !== '/login' && path !== '/signup') {
            console.log('Oturum kapalı, login sayfasına yönlendiriliyor');
            window.location.href = '/login';
            return;
        }

        // Normal routing yap
        await this.handleRouting();
    }

    async checkUserProfileAndRedirect(user) {
        try {
            const userProfile = await AuthService.getUserProfile(user.uid);
            const path = window.location.pathname;

            // Profil tamamlanmamışsa ve complete-profile'da değilsek
            if (
                !userProfile?.isProfileComplete &&
                path !== '/complete-profile'
            ) {
                console.log('Profil tamamlanmamış, yönlendiriliyor');
                window.location.href = '/complete-profile';
                return;
            }
        } catch (error) {
            console.error('Profil kontrolü hatası:', error);
        }
    }

    async handleRouting() {
        const path = window.location.pathname;
        console.log('Routing işlemi başladı:', path);

        try {
            // Profil sayfası kontrolü
            if (path.startsWith('/profile/')) {
                const username = path.split('/profile/')[1];
                if (username) {
                    await ProfilePage.render(username);
                    return;
                }
            }

            // Standart route işlemi
            switch (path) {
                case '/login':
                    if (this.currentUser) {
                        window.location.href = '/home';
                    } else {
                        await LoginPage.render();
                    }
                    break;

                case '/signup':
                    if (this.currentUser) {
                        window.location.href = '/home';
                    } else {
                        await SignupPage.render();
                    }
                    break;

                case '/complete-profile':
                    if (!this.currentUser) {
                        window.location.href = '/login';
                    } else {
                        await CompleteProfilePage.render();
                    }
                    break;

                case '/':
                case '/home':
                    if (!this.currentUser) {
                        window.location.href = '/login';
                    } else {
                        await HomePage.render();
                    }
                    break;

                default:
                    window.location.href = '/home';
                    break;
            }
        } catch (error) {
            console.error('Routing hatası:', error);
        }
    }

    navigateTo(path) {
        window.history.pushState(null, '', path);
        this.handleRouting();
    }
}

// Tek bir App instance oluştur
window.app = new App();
export default window.app;
