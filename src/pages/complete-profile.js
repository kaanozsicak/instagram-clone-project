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
                    }
                    
                    .complete-profile-container {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        background-color: var(--bg-color);
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        padding: 20px;
                    }
                    
                    .profile-form-card {
                        background-color: var(--card-color);
                        border-radius: 16px;
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                        width: 100%;
                        max-width: 500px;
                        padding: 40px;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .profile-form-card::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 6px;
                        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                    }
                    
                    h1 {
                        text-align: center;
                        margin-bottom: 1.5rem;
                        color: var(--primary-color);
                        font-size: 28px;
                        font-weight: 700;
                    }
                    
                    .form-group {
                        margin-bottom: 20px;
                        text-align: left;
                    }
                    
                    label {
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
                        box-sizing: border-box;
                    }
                    
                    .form-control:focus {
                        outline: none;
                        border-color: var(--primary-color);
                        box-shadow: 0 0 0 3px rgba(85, 99, 222, 0.2);
                    }
                    
                    textarea.form-control {
                        resize: vertical;
                        min-height: 100px;
                    }
                    
                    .profile-submit-btn {
                        width: 100%;
                        padding: 14px;
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background-color 0.2s ease, transform 0.1s ease;
                        margin-top: 10px;
                    }
                    
                    .profile-submit-btn:hover {
                        background-color: var(--primary-dark);
                        transform: translateY(-1px);
                    }
                    
                    .profile-submit-btn:disabled {
                        background-color: var(--primary-light);
                        cursor: not-allowed;
                        opacity: 0.7;
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
                        border: 3px solid var(--primary-light);
                    }
                    
                    .upload-btn {
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                        padding: 10px 15px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: background-color 0.2s;
                    }
                    
                    .upload-btn:hover {
                        background-color: var(--primary-dark);
                    }
                    
                    .username-container {
                        position: relative;
                    }
                    
                    #username-availability-status {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        font-size: 12px;
                        margin-top: 5px;
                    }
                    
                    @media (max-width: 576px) {
                        .profile-form-card {
                            padding: 30px 15px;
                        }
                    }
                </style>
                
                <div class="complete-profile-container">
                    <div class="profile-form-card">
                        <h1>Profilinizi Tamamlayın</h1>
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
                                    src="https://via.placeholder.com/150" 
                                    alt="Profil Resmi"
                                >
                                <button 
                                    type="button" 
                                    id="upload-image-btn"
                                    class="upload-btn"
                                >
                                    Profil Resmi Yükle
                                </button>
                            </div>
                            
                            <div class="username-container">
                                <div class="form-group">
                                    <label for="username">Kullanıcı Adı*</label>
                                    <input 
                                        type="text" 
                                        id="username" 
                                        class="form-control" 
                                        required
                                        placeholder="Benzersiz bir kullanıcı adı"
                                    >
                                </div>
                                <span id="username-availability-status"></span>
                            </div>
                            
                            <div class="form-group">
                                <label for="fullName">Adınız Soyadınız*</label>
                                <input 
                                    type="text" 
                                    id="fullName" 
                                    class="form-control" 
                                    required
                                    placeholder="Adınız ve soyadınız"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="bio">Biyografi</label>
                                <textarea 
                                    id="bio" 
                                    class="form-control" 
                                    rows="3"
                                    placeholder="Kendinizden kısaca bahsedin (isteğe bağlı)"
                                ></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="gender">Cinsiyet*</label>
                                <select id="gender" class="form-control" required>
                                    <option value="">Lütfen seçin</option>
                                    <option value="male">Erkek</option>
                                    <option value="female">Kadın</option>
                                    <option value="other">Diğer</option>
                                </select>
                            </div>
                            
                            <button type="submit" class="profile-submit-btn">Profili Kaydet</button>
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
                usernameStatus.style.color = 'red';
                isUsernameAvailable = false;
                return;
            }

            if (username.length < 3) {
                usernameStatus.textContent =
                    'Kullanıcı adı en az 3 karakter olmalıdır';
                usernameStatus.style.color = 'red';
                isUsernameAvailable = false;
                return;
            }

            usernameTimeout = setTimeout(async () => {
                usernameStatus.textContent = 'Kontrol ediliyor...';
                usernameStatus.style.color = '#666';

                try {
                    const available =
                        await AuthService.checkUsernameAvailability(username);

                    if (available) {
                        usernameStatus.textContent = '✓ Kullanıcı adı uygun';
                        usernameStatus.style.color = 'green';
                        isUsernameAvailable = true;
                    } else {
                        usernameStatus.textContent =
                            '✗ Bu kullanıcı adı zaten kullanılıyor';
                        usernameStatus.style.color = 'red';
                        isUsernameAvailable = false;
                    }
                } catch (error) {
                    console.error('Kullanıcı adı kontrolü hatası:', error);
                    usernameStatus.textContent =
                        'Kontrol sırasında bir hata oluştu';
                    usernameStatus.style.color = 'red';
                    isUsernameAvailable = false;
                }
            }, 500);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

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
                    alert('Kullanıcı adı en az 3 karakter olmalıdır');
                    return;
                }

                if (!isUsernameAvailable) {
                    alert('Lütfen farklı bir kullanıcı adı seçin');
                    return;
                }

                if (!fullName) {
                    alert('Adınızı ve soyadınızı girmelisiniz');
                    return;
                }

                if (!gender) {
                    alert('Lütfen cinsiyet seçimi yapın');
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
                const submitButton = document.querySelector(
                    '.profile-submit-btn'
                );
                submitButton.disabled = true;
                submitButton.textContent = 'Kaydediliyor...';

                await AuthService.updateUserProfile(
                    currentUser.uid,
                    profileData,
                    profileImage
                );

                alert('Profiliniz başarıyla oluşturuldu!');
                window.location.replace('/home');
            } catch (error) {
                console.error('Profil kaydetme hatası:', error);
                alert(`Profil kaydedilirken bir hata oluştu: ${error.message}`);

                // Hata durumunda butonu tekrar aktif hale getir
                const submitButton = document.querySelector(
                    '.profile-submit-btn'
                );
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Profili Kaydet';
                }
            }
        });
    }
}

export default CompleteProfilePage;
