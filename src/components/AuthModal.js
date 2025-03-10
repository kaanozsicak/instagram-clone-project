import { AuthService } from '../services/auth-service.js';

export class AuthModal {
    static render() {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <link rel="stylesheet" href="/styles/theme.css">
            <style>
                .auth-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .auth-container {
                    background-color: var(--card-color);
                    border-radius: 16px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                    width: 90%;
                    max-width: 420px;
                    padding: 30px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .auth-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                }
                
                .auth-switch {
                    display: flex;
                    border-bottom: 1px solid var(--border-color);
                    margin-bottom: 20px;
                }
                
                .auth-switch button {
                    flex: 1;
                    background: none;
                    border: none;
                    padding: 15px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: var(--text-secondary);
                }
                
                .auth-switch button.active {
                    color: var(--primary-color);
                    border-bottom: 3px solid var(--primary-color);
                }
                
                .auth-form {
                    display: none;
                    padding: 20px 0;
                }
                
                .auth-form.active {
                    display: block;
                }
                
                .auth-form h2 {
                    margin: 0 0 20px;
                    color: var(--text-primary);
                    font-size: 24px;
                }
                
                .form-group {
                    margin-bottom: 20px;
                    text-align: left;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                    font-weight: 500;
                    font-size: 14px;
                }
                
                .form-control {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 15px;
                    background-color: #f9fafc;
                    color: var(--text-primary);
                }
                
                .form-control:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(85, 99, 222, 0.2);
                }
                
                .btn-auth {
                    width: 100%;
                    padding: 14px;
                    margin-top: 10px;
                    background-color: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                
                .btn-auth:hover {
                    background-color: var(--primary-dark);
                }
                
                .error-message {
                    color: var(--error-color);
                    font-size: 14px;
                    margin-top: -10px;
                    margin-bottom: 10px;
                    text-align: left;
                }
                
                .social-login {
                    margin-top: 20px;
                }
                
                .social-login p {
                    color: var(--text-secondary);
                    margin-bottom: 15px;
                }
                
                .close-modal {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: var(--text-secondary);
                    cursor: pointer;
                }
                
                .close-modal:hover {
                    color: var(--text-primary);
                }
            </style>
            <div class="auth-modal">
                <div class="auth-container">
                    <button class="close-modal" id="close-auth-modal">&times;</button>
                    
                    <div class="auth-switch">
                        <button id="login-tab" class="active">Giriş Yap</button>
                        <button id="register-tab">Kayıt Ol</button>
                    </div>

                    <div id="login-form" class="auth-form active">
                        <h2>Giriş Yap</h2>
                        <form id="login-auth-form">
                            <div class="form-group">
                                <label for="login-email">E-posta</label>
                                <input 
                                    type="email" 
                                    id="login-email" 
                                    class="form-control" 
                                    required
                                    autocomplete="username"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="login-password">Şifre</label>
                                <input 
                                    type="password" 
                                    id="login-password" 
                                    class="form-control" 
                                    required
                                    autocomplete="current-password"
                                >
                            </div>
                            
                            <div id="login-error" class="error-message"></div>
                            
                            <button type="submit" class="btn-auth">Giriş Yap</button>
                        </form>
                        
                        <div class="divider">
                            <span class="divider-text">veya</span>
                        </div>
                        
                        <div class="social-login">
                            <div class="social-buttons">
                                <button id="google-login" class="btn-auth" style="background-color: #4285F4; margin-bottom: 10px;">
                                    Google ile Giriş Yap
                                </button>
                                <button id="facebook-login" class="btn-auth" style="background-color: #1877F2;">
                                    Facebook ile Giriş Yap
                                </button>
                            </div>
                        </div>
                    </div>

                    <div id="register-form" class="auth-form">
                        <h2>Hesap Oluştur</h2>
                        <form id="register-auth-form">
                            <div class="form-group">
                                <label for="register-fullname">Ad Soyad</label>
                                <input 
                                    type="text" 
                                    id="register-fullname" 
                                    class="form-control" 
                                    required
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="register-email">E-posta</label>
                                <input 
                                    type="email" 
                                    id="register-email" 
                                    class="form-control" 
                                    required
                                    autocomplete="username"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="register-password">Şifre</label>
                                <input 
                                    type="password" 
                                    id="register-password" 
                                    class="form-control" 
                                    required
                                    autocomplete="new-password"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="register-confirm-password">Şifre Tekrarı</label>
                                <input 
                                    type="password" 
                                    id="register-confirm-password" 
                                    class="form-control" 
                                    required
                                    autocomplete="new-password"
                                >
                            </div>
                            
                            <div id="register-error" class="error-message"></div>
                            
                            <button type="submit" class="btn-auth">Kayıt Ol</button>
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
        const closeModalBtn = document.getElementById('close-auth-modal');
        const loginAuthForm = document.getElementById('login-auth-form');
        const registerAuthForm = document.getElementById('register-auth-form');
        const googleLoginBtn = document.getElementById('google-login');
        const facebookLoginBtn = document.getElementById('facebook-login');
        const loginError = document.getElementById('login-error');
        const registerError = document.getElementById('register-error');
        const modal = document.querySelector('.auth-modal');

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

        // Modal kapatma
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Modal dışına tıklama
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Login form submit
        loginAuthForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                loginError.textContent = '';
                const submitBtn = loginAuthForm.querySelector('.btn-auth');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Giriş Yapılıyor...';

                await AuthService.login(email, password);
                window.location.href = '/home';
            } catch (error) {
                loginError.textContent = error.message || 'Giriş yapılamadı';
                const submitBtn = loginAuthForm.querySelector('.btn-auth');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Giriş Yap';
            }
        });

        // Register form submit
        registerAuthForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = document.getElementById('register-fullname').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById(
                'register-confirm-password'
            ).value;

            // Şifre kontrolü
            if (password !== confirmPassword) {
                registerError.textContent = 'Şifreler eşleşmiyor';
                return;
            }

            try {
                registerError.textContent = '';
                const submitBtn = registerAuthForm.querySelector('.btn-auth');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Kayıt Yapılıyor...';

                await AuthService.signup(email, password, { fullName });
                window.location.href = '/complete-profile';
            } catch (error) {
                registerError.textContent = error.message || 'Kayıt yapılamadı';
                const submitBtn = registerAuthForm.querySelector('.btn-auth');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Kayıt Ol';
            }
        });

        // Sosyal medya ile giriş
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', async () => {
                try {
                    await AuthService.loginWithGoogle();
                    window.location.href = '/home';
                } catch (error) {
                    loginError.textContent =
                        error.message || 'Google ile giriş yapılamadı';
                }
            });
        }

        if (facebookLoginBtn) {
            facebookLoginBtn.addEventListener('click', async () => {
                try {
                    await AuthService.loginWithFacebook();
                    window.location.href = '/home';
                } catch (error) {
                    loginError.textContent =
                        error.message || 'Facebook ile giriş yapılamadı';
                }
            });
        }
    }
}
