import { AuthService } from '../services/auth-service.js';

class LoginPage {
    static render() {
        console.log('Login sayfası render ediliyor');
        const appContainer = document.getElementById('app');

        if (!appContainer) {
            console.error('App container bulunamadı');
            return;
        }

        appContainer.innerHTML = `
            <!-- Harici stil dosyası yerine inline stil kullanıyoruz -->
            <style>
                :root {
                    --primary-color: #5563de;
                    --primary-light: #7b87e7;
                    --primary-dark: #3a47c2;
                    --secondary-color: #f27059;
                    --bg-color: #f5f8fc;
                    --card-color: #ffffff;
                    --text-primary: #333333;
                    --text-secondary: #666666;
                    --border-color: #e1e4ea;
                }
                
                .login-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: var(--bg-color);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    padding: 20px;
                }
                
                .login-card {
                    background-color: var(--card-color);
                    border-radius: 16px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 420px;
                    padding: 40px;
                    text-align: center;
                    overflow: hidden;
                    position: relative;
                }
                
                .login-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                }
                
                .app-logo {
                    margin-bottom: 24px;
                }
                
                .app-logo h1 {
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--primary-color);
                    margin: 0;
                }
                
                .app-tagline {
                    color: var(--text-secondary);
                    margin-bottom: 32px;
                    font-size: 16px;
                }
                
                .login-form {
                    margin-bottom: 24px;
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
                
                .form-group input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 15px;
                    transition: all 0.2s ease;
                    background-color: #f9fafc;
                    color: var(--text-primary);
                }
                
                .form-group input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(85, 99, 222, 0.2);
                }
                
                .submit-button {
                    width: 100%;
                    padding: 14px;
                    background-color: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    margin-top: 8px;
                }
                
                .submit-button:hover {
                    background-color: var(--primary-dark);
                }
                
                .submit-button:disabled {
                    background-color: var(--primary-light);
                    cursor: not-allowed;
                    opacity: 0.7;
                }
                
                .divider {
                    display: flex;
                    align-items: center;
                    margin: 28px 0;
                }
                
                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    border-top: 1px solid var(--border-color);
                }
                
                .divider-text {
                    padding: 0 16px;
                    color: var(--text-secondary);
                    font-size: 14px;
                    text-transform: uppercase;
                    font-weight: 500;
                }
                
                .social-login {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    margin-bottom: 28px;
                }
                
                .social-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: 1px solid var(--border-color);
                    background-color: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .social-button:hover {
                    background-color: #f5f5f5;
                    transform: translateY(-2px);
                }
                
                .social-icon {
                    width: 24px;
                    height: 24px;
                }
                
                .forgot-password {
                    display: block;
                    margin: 16px 0;
                    color: var(--primary-color);
                    font-size: 14px;
                    text-decoration: none;
                    font-weight: 500;
                }
                
                .forgot-password:hover {
                    text-decoration: underline;
                }
                
                .signup-link {
                    margin-top: 32px;
                    color: var(--text-secondary);
                    font-size: 15px;
                }
                
                .signup-link a {
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 600;
                }
                
                .signup-link a:hover {
                    text-decoration: underline;
                }
                
                @media (max-width: 480px) {
                    .login-card {
                        padding: 30px 20px;
                        border-radius: 12px;
                    }
                }
            </style>
            
            <div class="login-container">
                <div class="login-card">
                    <div class="app-logo">
                        <h1>Photogram</h1>
                    </div>
                    <p class="app-tagline">Fotoğraflarınızı paylaşın ve keşfedin</p>
                    
                    <form id="login-form" class="login-form">
                        <div class="form-group">
                            <label for="email">E-posta Adresi</label>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="E-posta adresinizi girin" 
                                required
                                autocomplete="username"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="password">Şifre</label>
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="Şifrenizi girin" 
                                required
                                autocomplete="current-password"
                            >
                        </div>
                        
                        <button type="submit" class="submit-button">Giriş Yap</button>
                    </form>
                    
                    <a href="#" class="forgot-password">Şifremi unuttum</a>
                    
                    <div class="divider">
                        <span class="divider-text">veya</span>
                    </div>
                    
                    <div class="social-login">
                        <button class="social-button" title="Google ile giriş yap">
                            <svg class="social-icon" viewBox="0 0 24 24">
                                <path fill="#EA4335" d="M12 5c1.617 0 3.101.554 4.274 1.479l3.171-3.172C17.455 1.523 14.887 0 12 0 7.392 0 3.397 2.6 1.386 6.386l3.662 2.849C6.188 6.642 8.874 5 12 5z"/>
                                <path fill="#4285F4" d="M23.896 13.502c0-.868-.072-1.704-.215-2.502H12v4.731h6.735c-.287 1.554-1.172 2.882-2.496 3.766v3.134h4.043c2.365-2.175 3.718-5.383 3.718-9.129z"/>
                                <path fill="#FBBC05" d="M5.047 14.537C4.822 13.737 4.698 12.892 4.698 12s.124-1.737.35-2.537L1.386 6.614C.502 8.259 0 10.066 0 12c0 1.934.502 3.741 1.386 5.386l3.661-2.849z"/>
                                <path fill="#34A853" d="M12 24c3.691 0 6.797-1.212 9.058-3.284l-4.043-3.134c-1.112.749-2.545 1.197-4.039 1.197-3.126 0-5.812-1.642-6.952-4.242L1.386 17.386C3.397 21.399 7.392 24 12 24z"/>
                            </svg>
                        </button>
                        <button class="social-button" title="Facebook ile giriş yap">
                            <svg class="social-icon" viewBox="0 0 24 24">
                                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </button>
                        <button class="social-button" title="Apple ile giriş yap">
                            <svg class="social-icon" viewBox="0 0 24 24">
                                <path fill="#000000" d="M17.05 20.28c-.98.95-2.05.8-3.08.4-1.09-.41-2.09-.42-3.19 0-1.38.56-2.11.35-3-.49C3.09 15.46 3.72 7.75 9.21 7.4c1.38.06 2.32.75 3.11.76 1.11-.1 2.17-.71 3.44-.6 1.41.12 2.62.8 3.32 1.82-2.74 1.87-2.29 5.99.48 7.4-.61 1.24-1.39 2.5-2.51 3.5zM12.03 7c-.13-2.76 2.16-5.13 4.91-5 .27 2.94-2.63 5.3-4.91 5z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="signup-link">
                        Hesabınız yok mu? <a href="/signup">Kayıt olun</a>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    static setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', this.handleLogin);
    }

    static async handleLogin(e) {
        e.preventDefault();
        console.log('Giriş işlemi başlatılıyor');

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        try {
            // Önce login butonunu devre dışı bırak
            const submitButton = document.querySelector(
                '#login-form button[type="submit"]'
            );
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Giriş yapılıyor...';
            }

            // Login işlemini gerçekleştir
            const userCredential = await AuthService.login(email, password);
            console.log('Giriş başarılı:', userCredential);

            // Home sayfasına yönlendir
            setTimeout(() => {
                window.location.replace('/home');
            }, 500);
        } catch (error) {
            console.error('Giriş hatası:', error);
            alert(error.message || 'Giriş yapılırken bir hata oluştu');

            // Butonu tekrar aktif et
            const submitButton = document.querySelector(
                '#login-form button[type="submit"]'
            );
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Giriş Yap';
            }
        }
    }
}

export default LoginPage;
