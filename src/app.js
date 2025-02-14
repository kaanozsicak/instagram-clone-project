import LoginPage from './pages/login.js';
import SignupPage from './pages/signup.js';
import HomePage from './pages/home.js';
import CompleteProfilePage from './pages/complete-profile.js';
import ProfilePage from './pages/profile.js';
import { AuthService } from './services/auth-service.js';

class App {
    constructor() {
        this.routes = {
            '/': HomePage,
            '/home': HomePage,
            '/login': LoginPage,
            '/signup': SignupPage,
            '/complete-profile': CompleteProfilePage,
            '/profile': ProfilePage,
            '/profile/:username': ProfilePage,
        };

        this.init();
    }

    init() {
        // Auth state değişikliğini dinle
        AuthService.onAuthStateChange(this.handleAuthStateChange.bind(this));

        // Sayfa yönlendirmelerini ayarla
        window.addEventListener('popstate', this.handleRouting.bind(this));

        // İlk sayfa yüklemesi
        this.handleRouting();
    }

    handleAuthStateChange(user) {
        console.log('Auth state değişikliği:', user);

        if (user) {
            // Kullanıcı bilgilerini yenile
            this.checkUserProfile(user);
        } else {
            // Kullanıcı çıkış yaptıysa login sayfasına yönlendir
            if (window.location.pathname !== '/signup') {
                this.navigateTo('/login');
            }
        }
    }

    async checkUserProfile(user) {
        try {
            const userProfile = await AuthService.getUserProfile(user.uid);

            console.log('Kullanıcı profil durumu:', userProfile);

            // Profil tamamlanmamışsa complete-profile sayfasına yönlendir
            if (!userProfile.isProfileComplete) {
                this.navigateTo('/complete-profile');
            }
        } catch (error) {
            console.error('Profil kontrol hatası:', error);
        }
    }

    handleRouting() {
        const path = window.location.pathname;
        console.log('Mevcut path:', path);

        // Profil sayfası için özel routing
        const profileMatch = path.match(/^\/profile\/(.+)$/);
        if (profileMatch) {
            const username = profileMatch[1];
            this.renderPage('/profile/:username', username);
            return;
        }

        // Normal routing
        this.renderPage(path);
    }

    async renderPage() {
        const path = window.location.pathname;

        try {
            if (path === '/') {
                window.location.href = '/home';
                return;
            }

            if (path === '/login') {
                await LoginPage.render();
            } else if (path === '/signup') {
                await SignupPage.render();
            } else if (path === '/home') {
                await HomePage.render();
            } else if (path.startsWith('/profile')) {
                const username = path.split('/profile/')[1];
                // Eğer /profile'a doğrudan erişilirse, mevcut kullanıcının profiline yönlendir
                if (!username || username === '') {
                    const currentUser = await AuthService.getCurrentUser();
                    if (currentUser) {
                        const userProfile = await AuthService.getUserProfile(
                            currentUser.uid
                        );
                        if (userProfile && userProfile.username) {
                            window.location.href = `/profile/${userProfile.username}`;
                            return;
                        }
                    }
                }
                await ProfilePage.render(username);
            } else {
                console.error('Sayfa bulunamadı');
            }
        } catch (error) {
            console.error('Sayfa render hatası:', error);
        }
    }

    navigateTo(path, state = {}) {
        window.history.pushState(state, '', path);
        this.handleRouting();
    }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    console.log('Uygulama başlatılıyor');
    new App();
});

export default App;
