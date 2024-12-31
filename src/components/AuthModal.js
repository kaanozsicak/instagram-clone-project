import { AuthService } from '../services/auth-service.js';

export class AuthModal {
    static render() {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="auth-modal">
                <div class="auth-container">
                    <div class="auth-switch">
                        <button id="login-tab" class="active">Giriş Yap</button>
                        <button id="register-tab">Kayıt Ol</button>
                    </div>

                    <div id="login-form" class="auth-form active">
                        <h2>Giriş Yap</h2>
                        <form id="login-form-submit">
                            <input 
                                type="email" 
                                id="login-email" 
                                placeholder="Email" 
                                required
                            >
                            <input 
                                type="password" 
                                id="login-password" 
                                placeholder="Şifre" 
                                required
                            >
                            <div id="error-message" class="error-message"></div>
                            <button type="submit">Giriş Yap</button>
                        </form>
                    </div>

                    <div id="register-form" class="auth-form">
                        <h2>Kayıt Ol</h2>
                        <form id="register-form-submit">
                            <input 
                                type="text" 
                                id="register-username" 
                                placeholder="Kullanıcı Adı" 
                                required
                            >
                            <input 
                                type="email" 
                                id="register-email" 
                                placeholder="Email" 
                                required
                            >
                            <input 
                                type="password" 
                                id="register-password" 
                                placeholder="Şifre" 
                                required
                            >
                            <input 
                                type="password" 
                                id="register-confirm-password" 
                                placeholder="Şifreyi Onayla" 
                                required
                            >
                            <div id="register-error-message" class="error-message"></div>
                            <button type="submit">Kayıt Ol</button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    static setupEventListeners() {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginFormSubmit = document.getElementById('login-form-submit');
        const registerFormSubmit = document.getElementById('register-form-submit');
        const errorMessageElement = document.getElementById('error-message');
        const registerErrorMessageElement = document.getElementById('register-error-message');

        // Tab değiştirme
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        });

        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        });

        // Giriş formu submit event listener
        loginFormSubmit.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const user = await AuthService.login(email, password);
                console.log('Giriş başarılı:', user);
                
                // Hata mesajını temizle
                if (errorMessageElement) {
                    errorMessageElement.textContent = '';
                    errorMessageElement.style.display = 'none';
                }

                // Başarılı giriş sonrası işlemler
                window.location.reload(); // Sayfayı yenile
            } catch (error) {
                console.error('Giriş hatası:', error);
                
                // Kullanıcıya daha net hata mesajı göster
                if (errorMessageElement) {
                    errorMessageElement.textContent = error.message;
                    errorMessageElement.style.display = 'block';
                }
            }
        });

        // Kayıt formu submit event listener
        registerFormSubmit.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            // Şifre eşleşme kontrolü
            if (password !== confirmPassword) {
                if (registerErrorMessageElement) {
                    registerErrorMessageElement.textContent = 'Şifreler eşleşmiyor';
                    registerErrorMessageElement.style.display = 'block';
                }
                return;
            }

            try {
                const user = await AuthService.register(email, password, username);
                console.log('Kayıt başarılı:', user);
                
                // Hata mesajını temizle
                if (registerErrorMessageElement) {
                    registerErrorMessageElement.textContent = '';
                    registerErrorMessageElement.style.display = 'none';
                }

                // Başarılı kayıt sonrası işlemler
                window.location.reload(); // Sayfayı yenile
            } catch (error) {
                console.error('Kayıt hatası:', error);
                
                // Kullanıcıya daha net hata mesajı göster
                if (registerErrorMessageElement) {
                    registerErrorMessageElement.textContent = error.message;
                    registerErrorMessageElement.style.display = 'block';
                }
            }
        });
    }
}