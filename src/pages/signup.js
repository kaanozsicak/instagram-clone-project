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
                .signup-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-dark) 100%);
                    padding: 20px;
                    position: relative;
                    overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                
                .signup-container::before {
                    content: "";
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%);
                    transform: rotate(30deg);
                }
                
                .signup-container::after {
                    content: "";
                    position: absolute;
                    bottom: -50%;
                    left: -50%;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%);
                    transform: rotate(-20deg);
                }
                
                .signup-card {
                    width: 100%;
                    max-width: 480px;
                    background-color: var(--card-color);
                    border-radius: 16px;
                    box-shadow: var(--shadow-xl);
                    padding: 40px;
                    text-align: center;
                    position: relative;
                    z-index: 10;
                    animation: fadeInUp 0.6s ease-out;
                    overflow: hidden;
                }
                
                .signup-card::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 6px;
                    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
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
                
                .signup-subtitle {
                    font-size: 16px;
                    color: var(--text-secondary);
                    margin-bottom: 30px;
                }
                
                .form-group {
                    margin-bottom: 24px;
                    position: relative;
                    text-align: left;
                }
                
                .form-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 15px;
                }
                
                .input {
                    width: 100%;
                    padding: 14px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-md);
                    font-size: 15px;
                    transition: all 0.3s ease;
                    background-color: var(--gray-50);
                }
                
                .input:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(85, 99, 222, 0.15);
                    background-color: white;
                    outline: none;
                }
                
                .btn {
                    width: 100%;
                    padding: 14px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    border-radius: var(--border-radius-md);
                    transition: all 0.3s ease;
                }
                
                .btn-primary {
                    background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
                    color: white;
                    box-shadow: 0 4px 8px rgba(46, 125, 50, 0.25);
                }
                
                .btn-primary:hover {
                    background: linear-gradient(90deg, var(--primary-dark), var(--primary-color));
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(46, 125, 50, 0.3);
                }
                
                .login-link {
                    margin-top: 30px;
                    color: var(--text-secondary);
                    font-size: 15px;
                }
                
                .login-link a {
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                
                .login-link a:hover {
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
                
                @media (max-width: 576px) {
                    .signup-card {
                        padding: 30px 20px;
                        border-radius: 12px;
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
            
            <div class="signup-container">
                <div class="floating-shapes">
                    <div class="shape1"></div>
                    <div class="shape2"></div>
                    <div class="shape3"></div>
                    <div class="shape4"></div>
                </div>
                
                <div class="signup-card">
                    <div class="brand-logo">Photogram</div>
                    <p class="signup-subtitle">Hesap oluştur ve fotoğraf paylaşmaya başla</p>
                    
                    <div class="alert alert-error" id="signup-error"></div>
                    
                    <form id="signup-form">
                        <div class="form-group">
                            <label class="form-label" for="email">E-posta</label>
                            <input 
                                type="email" 
                                class="input" 
                                id="email" 
                                placeholder="E-posta adresiniz" 
                                required
                                autocomplete="email"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="fullName">Ad Soyad</label>
                            <input 
                                type="text" 
                                class="input" 
                                id="fullName" 
                                placeholder="Adınız ve soyadınız" 
                                required
                            >
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="password">Şifre</label>
                            <input 
                                type="password" 
                                class="input" 
                                id="password" 
                                placeholder="En az 6 karakter" 
                                required
                                autocomplete="new-password"
                            >
                            <div class="form-hint">Şifreniz en az 6 karakter içermelidir</div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="password-confirm">Şifre Tekrarı</label>
                            <input 
                                type="password" 
                                class="input" 
                                id="password-confirm" 
                                placeholder="Şifrenizi tekrar girin" 
                                required
                                autocomplete="new-password"
                            >
                        </div>
                        
                        <button type="submit" class="btn btn-primary" id="signup-button">
                            <i class="fas fa-user-plus" style="margin-right: 8px;"></i> Hesap Oluştur
                        </button>
                    </form>
                    
                    <div class="login-link">
                        Zaten bir hesabınız var mı? <a href="/login">Giriş Yap</a>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    static setupEventListeners() {
        const signupForm = document.getElementById('signup-form');
        const signupError = document.getElementById('signup-error');

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const fullName = document.getElementById('fullName').value.trim();
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('password-confirm').value;
            const submitButton = document.getElementById('signup-button');
            
            // Reset error message
            signupError.style.display = 'none';
            
            // Validate input
            if (password !== passwordConfirm) {
                signupError.textContent = 'Şifreler eşleşmiyor';
                signupError.style.display = 'block';
                return;
            }
            
            if (password.length < 6) {
                signupError.textContent = 'Şifre en az 6 karakter olmalıdır';
                signupError.style.display = 'block';
                return;
            }
            
            try {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner spinner-sm"></span> Hesap Oluşturuluyor...';
                
                const user = await AuthService.signup(email, password, { fullName });
                
                // Redirect to complete profile page
                window.location.href = '/complete-profile';
            } catch (error) {
                console.error('Kayıt hatası:', error);
                signupError.textContent = error.message || 'Kayıt sırasında bir hata oluştu';
                signupError.style.display = 'block';
                
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-user-plus" style="margin-right: 8px;"></i> Hesap Oluştur';
            }
        });
    }
}

export default SignupPage;
