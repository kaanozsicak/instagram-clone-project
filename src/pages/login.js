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
            <style>
                .login-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #fafafa;
                    font-family: 'Arial', sans-serif;
                }
                .login-wrapper {
                    background-color: white;
                    border: 1px solid #dbdbdb;
                    border-radius: 10px;
                    width: 100%;
                    max-width: 400px;
                    padding: 30px;
                    text-align: center;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .login-wrapper h2 {
                    color: #262626;
                    margin-bottom: 20px;
                }
                .login-form input {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 15px;
                    border: 1px solid #dbdbdb;
                    border-radius: 5px;
                    box-sizing: border-box;
                }
                .login-form button {
                    width: 100%;
                    padding: 12px;
                    background-color: #0095f6;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .login-form button:hover {
                    background-color: #0077cc;
                }
                .signup-link {
                    margin-top: 15px;
                    color: #262626;
                }
                .signup-link a {
                    color: #0095f6;
                    text-decoration: none;
                }
            </style>
            <div class="login-container">
                <div class="login-wrapper">
                    <h2>Giriş Yap</h2>
                    <form id="login-form" class="login-form">
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
                            autocomplete="current-password"
                        >
                        <button type="submit">Giriş Yap</button>
                    </form>
                    <div class="signup-link">
                        Hesabınız yok mu? 
                        <a href="/signup">Kayıt Olun</a>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    static setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }

    static async handleLogin(e) {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        try {
            const user = await AuthService.login(email, password);
            
            if (user) {
                // Kullanıcı profili tamamlanmışsa ana sayfaya yönlendir
                window.location.href = '/home';
            }
            // Eğer user null ise (profil tamamlanmamışsa) zaten login metodu yönlendirme yapacak

        } catch (error) {
            console.error('Giriş hatası:', error);
            alert(error.message || 'Giriş sırasında bir hata oluştu');
        }
    }
}

export default LoginPage;