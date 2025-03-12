import { AuthService } from '../services/auth-service.js';

class SignupPage {
    static render() {
        console.log('Signup sayfası render ediliyor');
        const appContainer = document.getElementById('app');

        if (!appContainer) {
            console.error('App container bulunamadı');
            return;
        }

        appContainer.innerHTML = `
            <link rel="stylesheet" href="/src/styles/ui-components.css">
            
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
                    --error-color: #e74c3c;
                    --success-color: #2ecc71;
                    --warning-color: #f39c12;
                    --info-color: #3498db;
                }
                
                .signup-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: var(--bg-color);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    padding: 20px;
                }
                
                .signup-card {
                    width: 100%;
                    max-width: 480px;
                    padding: 40px;
                    background-color: var(--card-color);
                    border-radius: 16px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                    position: relative;
                    overflow: hidden;
                }
                
                .signup-card::before {
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
                
                .signup-form {
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
                
                .form-control {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 15px;
                    transition: all 0.2s ease;
                    background-color: #f9fafc;
                    color: var(--text-primary);
                }
                
                .form-control:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(85, 99, 222, 0.2);
                }
                
                .submit-button {
                    width: 100%;
                    padding: 14px;
                    margin-top: 16px;
                    background-color: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                
                .submit-button:hover {
                    background-color: var(--primary-dark);
                }
                
                .login-link {
                    margin-top: 32px;
                    color: var(--text-secondary);
                    font-size: 15px;
                    text-align: center;
                }
                
                .login-link a {
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 600;
                }
                
                .login-link a:hover {
                    text-decoration: underline;
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
                    margin: 20px 0;
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
                
                @media (max-width: 480px) {
                    .signup-card {
                        padding: 30px 20px;
                        border-radius: 12px;
                    }
                }
            </style>
            
            <div class="auth-container">
                <div class="auth-form-container">
                    <h2 class="auth-title">Photogram</h2>
                    <p class="auth-subtitle">Hesap oluştur ve fotoğraf paylaş</p>
                    
                    <form id="signup-form">
                        <div class="input-group">
                            <input type="text" placeholder="E-posta" id="email" class="input">
                        </div>
                        <div class="input-group">
                            <input type="password" placeholder="Şifre" id="password" class="input">
                        </div>
                        <div class="input-group">
                            <input type="password" placeholder="Şifre (Tekrar)" id="password-confirm" class="input">
                        </div>
                        <button type="submit" id="signup-button" class="btn btn-primary btn-block">Kayıt Ol</button>
                    </form>
                    
                    <div class="social-signup">
                        <button id="google-signup" class="btn btn-outline social-btn">
                            <i class="fab fa-google"></i> Google ile Kayıt
                        </button>
                        <button id="facebook-signup" class="btn btn-outline social-btn">
                            <i class="fab fa-facebook"></i> Facebook ile Kayıt
                        </button>
                    </div>
                    
                    <div class="login-link">
                        Zaten bir hesabınız var mı? <a href="/login">Giriş Yapın</a>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    static setupEventListeners() {
        const signupForm = document.getElementById('signup-form');
        signupForm.addEventListener('submit', this.handleSignup.bind(this));
    }

    static async handleSignup(e) {
        e.preventDefault();

        const fullNameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Doğrulamalar
        if (password !== confirmPassword) {
            alert('Şifreler eşleşmiyor');
            return;
        }

        if (password.length < 6) {
            alert('Şifre en az 6 karakter olmalıdır');
            return;
        }

        try {
            const user = await AuthService.signup(email, password, {
                fullName,
            });

            console.log('Kullanıcı başarıyla oluşturuldu:', user);

            // Profil tamamlama sayfasına yönlendir
            window.location.href = '/complete-profile';
        } catch (error) {
            console.error('Kayıt hatası:', error);
            alert(error.message || 'Kayıt sırasında bir hata oluştu');
        }
    }
}

export default SignupPage;
