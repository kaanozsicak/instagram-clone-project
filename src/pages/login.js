import { AuthService } from '../services/auth-service.js';

class LoginPage {
    static async render() {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        appContainer.innerHTML = `
            <link rel="stylesheet" href="./src/styles/ui-components.css">
            
            <style>
                .auth-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-dark) 100%);
                    padding: 20px;
                    position: relative;
                    overflow: hidden;
                }
                
                .auth-page::before {
                    content: "";
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%);
                    transform: rotate(30deg);
                }
                
                .auth-page::after {
                    content: "";
                    position: absolute;
                    bottom: -50%;
                    left: -50%;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%);
                    transform: rotate(-20deg);
                }
                
                .login-container {
                    width: 100%;
                    max-width: 420px;
                    background-color: var(--card-color);
                    border-radius: var(--border-radius-lg);
                    box-shadow: var(--shadow-xl);
                    padding: 40px;
                    text-align: center;
                    position: relative;
                    z-index: 10;
                    animation: fadeInUp 0.6s ease-out;
                    overflow: hidden;
                }
                
                .login-container::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 6px;
                    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
                }
                
                .form-title {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 30px;
                    color: var(--primary-color);
                    text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
                }
                
                .form-group {
                    margin-bottom: 24px;
                    position: relative;
                }
                
                .form-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: var(--text-primary);
                    text-align: left;
                    font-size: 15px;
                }
                
                .form-control {
                    width: 100%;
                    padding: 14px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-md);
                    font-size: 16px;
                    transition: all 0.3s ease;
                    background-color: var(--gray-50);
                }
                
                .form-control:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(85, 99, 222, 0.15);
                    background-color: white;
                }
                
                .form-text {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-top: 6px;
                    text-align: left;
                }
                
                .login-btn {
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
                    color: white;
                    border: none;
                    border-radius: var(--border-radius-md);
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-bottom: 16px;
                    box-shadow: 0 4px 8px rgba(46, 125, 50, 0.25);
                }
                
                .login-btn:hover {
                    background: linear-gradient(90deg, var(--primary-dark), var(--primary-color));
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(46, 125, 50, 0.3);
                }
                
                .auth-footer {
                    margin-top: 32px;
                    color: var(--text-secondary);
                }
                
                .auth-footer a {
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }
                
                .auth-footer a:hover {
                    color: var(--primary-dark);
                    text-decoration: underline;
                }
                
                .alert {
                    padding: 14px 16px;
                    margin-bottom: 24px;
                    border-radius: var(--border-radius-md);
                    font-weight: 500;
                    display: none;
                    text-align: left;
                }
                
                .alert-error {
                    background-color: rgba(239, 68, 68, 0.1);
                    color: var(--error-color);
                    border-left: 3px solid var(--error-color);
                }
                
                .brand-logo {
                    font-size: 32px;
                    font-weight: 800;
                    margin-bottom: 30px;
                    color: var(--primary-color);
                    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: 1px;
                }
                
                .login-banner {
                    background: linear-gradient(45deg, var(--primary-light), var(--secondary-light));
                    color: white;
                    padding: 15px;
                    border-radius: var(--border-radius-md);
                    margin-bottom: 30px;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.1);
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .form-icon {
                    position: absolute;
                    top: 50%;
                    right: 12px;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                }
                
                .password-group {
                    position: relative;
                }
                
                .toggle-password {
                    position: absolute;
                    top: 50%;
                    right: 12px;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 5px;
                }
                
                .toggle-password:hover {
                    color: var(--primary-color);
                }
                
                @media (max-width: 480px) {
                    .login-container {
                        padding: 30px 20px;
                        max-width: 100%;
                    }
                }
                
                .floating-shapes div {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    z-index: 1;
                }
                
                .shape1 {
                    width: 200px;
                    height: 200px;
                    top: -100px;
                    left: -100px;
                    animation: float 8s infinite ease-in-out;
                }
                
                .shape2 {
                    width: 150px;
                    height: 150px;
                    bottom: 50px;
                    right: -50px;
                    animation: float 10s infinite ease-in-out reverse;
                }
                
                .shape3 {
                    width: 80px;
                    height: 80px;
                    bottom: -30px;
                    left: 10%;
                    animation: float 7s infinite ease-in-out;
                }
                
                .shape4 {
                    width: 50px;
                    height: 50px;
                    top: 30%;
                    right: 10%;
                    animation: float 9s infinite ease-in-out reverse;
                }
                
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
            </style>
            
            <div class="auth-page">
                <div class="floating-shapes">
                    <div class="shape1"></div>
                    <div class="shape2"></div>
                    <div class="shape3"></div>
                    <div class="shape4"></div>
                </div>
                
                <div class="login-container">
                    <div class="brand-logo">Photogram</div>
                    
                    <div class="login-banner">
                        <p>👋 Sosyal deneyimine hoş geldin!</p>
                    </div>
                    
                    <div class="alert alert-error" id="error-message"></div>
                    
                    <form id="login-form">
                        <div class="form-group">
                            <label class="form-label" for="email">E-posta</label>
                            <input 
                                type="email" 
                                class="form-control" 
                                id="email" 
                                placeholder="E-posta adresiniz" 
                                required
                                autocomplete="email"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="password">Şifre</label>
                            <div class="password-group">
                                <input 
                                    type="password" 
                                    class="form-control" 
                                    id="password" 
                                    placeholder="Şifreniz" 
                                    required
                                    autocomplete="current-password"
                                >
                                <button 
                                    type="button" 
                                    class="toggle-password" 
                                    id="toggle-password"
                                >
                                    <i class="far fa-eye"></i>
                                </button>
                            </div>
                            <div class="form-text">En az 6 karakter olmalıdır</div>
                        </div>
                        
                        <button type="submit" class="login-btn" id="login-button">
                            <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>Giriş Yap
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Henüz bir hesabınız yok mu? <a href="/signup" id="signup-link">Kaydol</a></p>
                        <p style="margin-top: 10px; font-size: 13px;">Giriş yaparak, <a href="#">Kullanım Şartları</a> ve <a href="#">Gizlilik Politikası</a>'nı kabul etmiş olursunuz.</p>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    static setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        const signupLink = document.getElementById('signup-link');
        const errorMessage = document.getElementById('error-message');
        const togglePassword = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password');

        // Şifre göster/gizle butonu
        togglePassword.addEventListener('click', () => {
            const type =
                passwordInput.getAttribute('type') === 'password'
                    ? 'text'
                    : 'password';
            passwordInput.setAttribute('type', type);

            // Göz ikonunu değiştir
            togglePassword.innerHTML =
                type === 'password'
                    ? '<i class="far fa-eye"></i>'
                    : '<i class="far fa-eye-slash"></i>';
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginButton = document.getElementById('login-button');

            try {
                errorMessage.style.display = 'none';
                loginButton.disabled = true;
                loginButton.innerHTML =
                    '<span class="spinner spinner-sm"></span> Giriş Yapılıyor...';

                await AuthService.login(email, password);
                window.location.href = '/home';
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent =
                    error.message ||
                    'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
                errorMessage.style.display = 'block';
                loginButton.disabled = false;
                loginButton.innerHTML =
                    '<i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>Giriş Yap';
            }
        });

        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/signup';
        });
    }
}

export default LoginPage;
