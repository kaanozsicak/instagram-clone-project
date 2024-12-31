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
            '/profile/:username': ProfilePage
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

    async renderPage(path, param = null) {
        const PageComponent = this.routes[path];

        if (!PageComponent) {
            console.error('Sayfa bulunamadı:', path);
            this.navigateTo('/home');
            return;
        }

        try {
            // Parametreli sayfa render etme
            if (param) {
                await PageComponent.render(param);
            } else {
                await PageComponent.render();
            }
        } catch (error) {
            console.error('Sayfa render hatası:', error);
            this.navigateTo('/home');
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