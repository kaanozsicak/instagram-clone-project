import { AuthService } from '../services/auth-service.js';

class CompleteProfilePage {
    static async render() {
        console.log('Profil tamamlama sayfası render ediliyor');
        try {
            const currentUser = await AuthService.getCurrentUser();

            if (!currentUser) {
                console.log(
                    'Kullanıcı oturumu yok, login sayfasına yönlendiriliyor'
                );
                window.location.replace('/login');
                return;
            }

            const userProfile = await AuthService.getUserProfile(
                currentUser.uid
            );
            if (userProfile && userProfile.isProfileComplete) {
                console.log(
                    'Profil zaten tamamlanmış, ana sayfaya yönlendiriliyor'
                );
                window.location.replace('/home');
                return;
            }

            const appContainer = document.getElementById('app');
            if (!appContainer) {
                console.error('App container bulunamadı');
                return;
            }

            // HTML içeriğini oluştur
            appContainer.innerHTML = `
                <link rel="stylesheet" href="/src/styles/ui-components.css">
                
                <style>
                    .complete-profile-container {
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
                    
                    .complete-profile-container::before {
                        content: "";
                        position: absolute;
                        top: -50%;
                        right: -50%;
                        width: 100%;
                        height: 100%;
                        background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%);
                        transform: rotate(30deg);
                    }
                    
                    .complete-profile-container::after {
                        content: "";
                        position: absolute;
                        bottom: -50%;
                        left: -50%;
                        width: 100%;
                        height: 100%;
                        background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%);
                        transform: rotate(-20deg);
                    }
                    
                    .profile-form-card {
                        width: 100%;
                        max-width: 500px;
                        background-color: var(--card-color);
                        border-radius: 16px;
                        box-shadow: var(--shadow-xl);
                        padding: 40px;
                        text-align: center;
                        position: relative;
                        z-index: 10;
                        animation: fadeInUp 0.6s ease-out;
                    }
                    
                    .profile-form-card::before {
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
                        margin-bottom: 10px;
                        color: var(--primary-color);
                        background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        letter-spacing: 1px;
                    }
                    
                    h1 {
                        font-size: 24px;
                        font-weight: 600;
                        margin-bottom: 25px;
                        color: var(--text-primary);
                    }
                    
                    .form-subtitle {
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
                    
                    .select {
                        width: 100%;
                        padding: 14px 16px;
                        border: 1px solid var(--border-color);
                        border-radius: var(--border-radius-md);
                        font-size: 15px;
                        transition: all 0.3s ease;
                        background-color: var(--gray-50);
                        appearance: none;
                        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                        background-repeat: no-repeat;
                        background-position: right 16px center;
                        background-size: 16px;
                    }
                    
                    .select:focus {
                        border-color: var(--primary-color);
                        box-shadow: 0 0 0 3px rgba(85, 99, 222, 0.15);
                        background-color: white;
                        outline: none;
                    }
                    
                    textarea.input {
                        resize: vertical;
                        min-height: 100px;
                    }
                    
                    .form-hint {
                        font-size: 13px;
                        color: var(--text-secondary);
                        margin-top: 6px;
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
                    
                    .btn-primary:disabled {
                        opacity: 0.7;
                        cursor: not-allowed;
                        transform: none;
                    }
                    
                    .profile-image-upload {
                        margin-bottom: 30px;
                        text-align: center;
                    }
                    
                    .profile-image-preview {
                        width: 120px;
                        height: 120px;
                        border-radius: 50%;
                        object-fit: cover;
                        margin-bottom: 15px;
                        border: 3px solid transparent;
                        background-image: linear-gradient(#fff, #fff), 
                                          linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                        background-origin: border-box;
                        background-clip: content-box, border-box;
                    }
                    
                    .upload-btn {
                        background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
                        color: white;
                        border: none;
                        padding: 10px 16px;
                        border-radius: var(--border-radius-md);
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    
                    .upload-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                    }
                    
                    .username-status {
                        font-size: 13px;
                        margin-top: 6px;
                        display: block;
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
                        .profile-form-card {
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
                
                <div class="complete-profile-container">
                    <div class="floating-shapes">
                        <div class="shape1"></div>
                        <div class="shape2"></div>
                        <div class="shape3"></div>
                        <div class="shape4"></div>
                    </div>
                    
                    <div class="profile-form-card">
                        <div class="brand-logo">Photogram</div>
                        <h1>Profilinizi Tamamlayın</h1>
                        <p class="form-subtitle">Kişiselleştirilmiş deneyim için birkaç bilgi daha ekleyelim</p>
                        
                        <div class="alert alert-error" id="profile-error"></div>
                        
                        <form id="profile-form">
                            <div class="profile-image-upload">
                                <input 
                                    type="file" 
                                    id="profileImage" 
                                    accept="image/*"
                                    style="display:none;"
                                >
                                <img 
                                    id="profile-image-preview" 
                                    class="profile-image-preview"
                                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4=" 
                                    alt="Profil Resmi"
                                >
                                <button 
                                    type="button" 
                                    id="upload-image-btn"
                                    class="upload-btn"
                                >
                                    <i class="fas fa-camera" style="margin-right: 8px;"></i> Profil Resmi Ekle
                                </button>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="username">Kullanıcı Adı*</label>
                                <input 
                                    type="text" 
                                    id="username" 
                                    class="input" 
                                    required
                                    placeholder="Benzersiz bir kullanıcı adı seçin"
                                >
                                <span id="username-availability-status" class="username-status"></span>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="fullName">Ad Soyad*</label>
                                <input 
                                    type="text" 
                                    id="fullName" 
                                    class="input" 
                                    required
                                    placeholder="Adınız ve soyadınız"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="bio">Biyografi</label>
                                <textarea 
                                    id="bio" 
                                    class="input" 
                                    rows="3"
                                    placeholder="Kendinizden kısaca bahsedin (isteğe bağlı)"
                                ></textarea>
                                <div class="form-hint">Diğer kullanıcıların sizi tanıması için kısa bir açıklama ekleyin</div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="gender">Cinsiyet*</label>
                                <select id="gender" class="select" required>
                                    <option value="">Cinsiyet seçiniz</option>
                                    <option value="male">Erkek</option>
                                    <option value="female">Kadın</option>
                                    <option value="other">Diğer</option>
                                </select>
                            </div>
                            
                            <button type="submit" class="btn btn-primary" id="profile-submit-btn">
                                <i class="fas fa-check-circle" style="margin-right: 8px;"></i> Profili Tamamla
                            </button>
                        </form>
                    </div>
                </div>
            `;

            this.setupFormListeners();
        } catch (error) {
            console.error('Profil tamamlama render hatası:', error);
        }
    }

    static setupFormListeners() {
        const form = document.getElementById('profile-form');
        if (!form) {
            console.error('Profil formu bulunamadı');
            return;
        }

        // Profil resmi yükleme
        const profileImageInput = document.getElementById('profileImage');
        const profileImagePreview = document.getElementById(
            'profile-image-preview'
        );
        const uploadImageBtn = document.getElementById('upload-image-btn');
        const profileError = document.getElementById('profile-error');

        uploadImageBtn.addEventListener('click', () => {
            profileImageInput.click();
        });

        profileImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    profileImagePreview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Kullanıcı adı benzersizlik kontrolü
        const usernameInput = document.getElementById('username');
        const usernameStatus = document.getElementById(
            'username-availability-status'
        );
        let isUsernameAvailable = false;
        let usernameTimeout;

        usernameInput.addEventListener('input', (e) => {
            const username = e.target.value.trim();

            clearTimeout(usernameTimeout);

            // Kullanıcı adı uygunluk kontrolü
            const usernameRegex = /^[a-z0-9_]+$/;

            if (!usernameRegex.test(username)) {
                usernameStatus.textContent =
                    'Kullanıcı adı sadece küçük harf, rakam ve alt çizgi içerebilir';
                usernameStatus.style.color = 'var(--error-color)';
                isUsernameAvailable = false;
                return;
            }

            if (username.length < 3) {
                usernameStatus.textContent =
                    'Kullanıcı adı en az 3 karakter olmalıdır';
                usernameStatus.style.color = 'var(--error-color)';
                isUsernameAvailable = false;
                return;
            }

            usernameTimeout = setTimeout(async () => {
                usernameStatus.textContent = 'Kontrol ediliyor...';
                usernameStatus.style.color = 'var(--text-secondary)';

                try {
                    const available =
                        await AuthService.checkUsernameAvailability(username);

                    if (available) {
                        usernameStatus.textContent = '✓ Kullanıcı adı uygun';
                        usernameStatus.style.color = 'var(--success-color)';
                        isUsernameAvailable = true;
                    } else {
                        usernameStatus.textContent =
                            '✗ Bu kullanıcı adı zaten kullanılıyor';
                        usernameStatus.style.color = 'var(--error-color)';
                        isUsernameAvailable = false;
                    }
                } catch (error) {
                    console.error('Kullanıcı adı kontrolü hatası:', error);
                    usernameStatus.textContent =
                        'Kontrol sırasında bir hata oluştu';
                    usernameStatus.style.color = 'var(--error-color)';
                    isUsernameAvailable = false;
                }
            }, 500);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Reset error message
            profileError.style.display = 'none';

            try {
                const username = document
                    .getElementById('username')
                    .value.trim();
                const fullName = document
                    .getElementById('fullName')
                    .value.trim();
                const bio = document.getElementById('bio').value.trim();
                const profileImageInput =
                    document.getElementById('profileImage');
                const profileImage =
                    profileImageInput.files.length > 0
                        ? profileImageInput.files[0]
                        : null;
                const gender = document.getElementById('gender').value;

                // Validasyonlar
                if (!username || username.length < 3) {
                    profileError.textContent = 'Kullanıcı adı en az 3 karakter olmalıdır';
                    profileError.style.display = 'block';
                    return;
                }

                if (!isUsernameAvailable) {
                    profileError.textContent = 'Lütfen farklı bir kullanıcı adı seçin';
                    profileError.style.display = 'block';
                    return;
                }

                if (!fullName) {
                    profileError.textContent = 'Adınızı ve soyadınızı girmelisiniz';
                    profileError.style.display = 'block';
                    return;
                }

                if (!gender) {
                    profileError.textContent = 'Lütfen cinsiyet seçimi yapın';
                    profileError.style.display = 'block';
                    return;
                }

                const currentUser = AuthService.getCurrentUser();
                if (!currentUser) {
                    alert('Oturum açık değil');
                    window.location.replace('/login');
                    return;
                }

                // Profil bilgilerini güncelle
                const profileData = {
                    username: username.toLowerCase(),
                    fullName,
                    bio,
                    gender,
                    isProfileComplete: true,
                };

                // Butonun durumunu güncelleyerek kullanıcıya geri bildirim ver
                const submitButton = document.getElementById('profile-submit-btn');
                submitButton.disabled = true;
                submitButton.innerHTML =
                    '<span class="spinner spinner-sm"></span> Kaydediliyor...';

                await AuthService.updateUserProfile(
                    currentUser.uid,
                    profileData,
                    profileImage
                );

                alert('Profiliniz başarıyla oluşturuldu!');
                window.location.replace('/home');
            } catch (error) {
                console.error('Profil kaydetme hatası:', error);
                profileError.textContent = `Profil kaydedilirken bir hata oluştu: ${error.message}`;
                profileError.style.display = 'block';

                // Hata durumunda butonu tekrar aktif hale getir
                const submitButton = document.getElementById('profile-submit-btn');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML =
                        '<i class="fas fa-check-circle" style="margin-right: 8px;"></i> Profili Tamamla';
                }
            }
        });
    }
}

export default CompleteProfilePage;
