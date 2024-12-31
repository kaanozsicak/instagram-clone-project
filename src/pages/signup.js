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
            <style>
                .signup-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #fafafa;
                    font-family: 'Arial', sans-serif;
                }
                .signup-wrapper {
                    background-color: white;
                    border: 1px solid #dbdbdb;
                    border-radius: 10px;
                    width: 100%;
                    max-width: 400px;
                    padding: 30px;
                    text-align: center;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .signup-wrapper h2 {
                    color: #262626;
                    margin-bottom: 20px;
                }
                .signup-form input {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 15px;
                    border: 1px solid #dbdbdb;
                    border-radius: 5px;
                    box-sizing: border-box;
                }
                .signup-form button {
                    width: 100%;
                    padding: 12px;
                    background-color: #0095f6;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .signup-form button:hover {
                    background-color: #0077cc;
                }
                .login-link {
                    margin-top: 15px;
                    color: #262626;
                }
                .login-link a {
                    color: #0095f6;
                    text-decoration: none;
                }
            </style>
            <div class="signup-container">
                <div class="signup-wrapper">
                    <h2>Hesap Oluştur</h2>
                    <form id="signup-form" class="signup-form">
                        <input 
                            type="text" 
                            id="fullName" 
                            placeholder="Ad Soyad" 
                            required
                        >
                        <input 
                            type="email" 
                            id="email" 
                            placeholder="E-posta" 
                            required
                            autocomplete="username"
                        >
                        <input 
                            type="password" 
                            id="password" 
                            placeholder="Şifre" 
                            required
                            autocomplete="new-password"
                        >
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            placeholder="Şifreyi Onayla" 
                            required
                            autocomplete="new-password"
                        >
                        <button type="submit">Kayıt Ol</button>
                    </form>
                    <div class="login-link">
                        Zaten bir hesabınız var mı? 
                        <a href="/login">Giriş Yapın</a>
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
            const user = await AuthService.signup(email, password, { fullName });
            
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