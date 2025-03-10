import { AuthService } from '../services/auth-service.js';
import { StorageService } from '../services/storage-service.js';

export class ProfileSetup {
    static render() {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        appContainer.innerHTML = `
            <link rel="stylesheet" href="/styles/theme.css">
            <style>
                .profile-setup-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: var(--bg-color);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    padding: 20px;
                }
                
                .profile-setup-form {
                    background-color: var(--card-color);
                    border-radius: 16px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 520px;
                    padding: 40px;
                    text-align: center;
                    position: relative;
                }
                
                .profile-setup-form::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                }
                
                h2 {
                    font-size: 28px;
                    color: var(--primary-color);
                    margin-bottom: 30px;
                }
                
                .profile-picture-upload {
                    margin-bottom: 30px;
                    position: relative;
                }
                
                #profile-picture-preview {
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
                    margin-bottom: 20px;
                }
                
                #username-availability-status {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    font-size: 12px;
                    margin-top: 5px;
                }
                
                .gender-select {
                    margin-bottom: 20px;
                    text-align: left;
                }
                
                .gender-select label {
                    display: block;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                    font-weight: 500;
                    font-size: 14px;
                }
                
                .gender-select select {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background-color: #f9fafc;
                    color: var(--text-primary);
                    font-size: 15px;
                }
                
                .submit-btn {
                    width: 100%;
                    padding: 14px;
                    background-color: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 20px;
                    transition: background-color 0.2s;
                }
                
                .submit-btn:hover {
                    background-color: var(--primary-dark);
                }
            </style>
            <div class="profile-setup-container">
                <div class="profile-setup-form">
                    <h2>Profilinizi Oluşturun</h2>
                    <form id="profile-setup-form">
                        <div class="profile-picture-upload">
                            <input 
                                type="file" 
                                id="profile-picture" 
                                accept="image/*"
                                style="display:none;"
                            >
                            <img 
                                id="profile-picture-preview" 
                                src="https://via.placeholder.com/150" 
                                alt="Profil Resmi"
                            >
                            <button 
                                type="button" 
                                id="upload-picture-btn"
                                class="upload-btn"
                            >
                                Profil Resmi Yükle
                            </button>
                        </div>

                        <div class="form-group">
                            <label for="full-name">Ad Soyad</label>
                            <input 
                                type="text" 
                                id="full-name" 
                                class="form-control"
                                placeholder="Adınız ve soyadınız" 
                                required
                            >
                        </div>
                        
                        <div class="username-container">
                            <div class="form-group">
                                <label for="username">Kullanıcı Adı</label>
                                <input 
                                    type="text" 
                                    id="username"
                                    class="form-control" 
                                    placeholder="Kullanıcı adınız" 
                                    required
                                >
                            </div>
                            <span id="username-availability-status"></span>
                        </div>
                        
                        <div class="form-group">
                            <label for="bio">Biyografi</label>
                            <textarea 
                                id="bio" 
                                class="form-control"
                                placeholder="Kendinizi kısaca tanıtın (İsteğe bağlı)"
                                rows="3"
                            ></textarea>
                        </div>
                        
                        <div class="gender-select">
                            <label>Cinsiyet:</label>
                            <select id="gender" class="form-control">
                                <option value="">Seçiniz</option>
                                <option value="male">Erkek</option>
                                <option value="female">Kadın</option>
                                <option value="other">Diğer</option>
                            </select>
                        </div>

                        <button type="submit" class="submit-btn">Profili Oluştur</button>
                    </form>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    static async checkUsernameAvailability(username) {
        try {
            console.log('Kullanıcı adı kontrolü:', username);

            const available = await AuthService.checkUsernameAvailability(
                username
            );

            console.log('Kullanıcı adı kullanılabilirlik durumu:', available);
            return available;
        } catch (error) {
            console.error('Kullanıcı adı kontrolü hatası:', error);
            return false;
        }
    }

    static setupEventListeners() {
        const form = document.getElementById('profile-setup-form');
        const profilePictureInput = document.getElementById('profile-picture');
        const profilePicturePreview = document.getElementById(
            'profile-picture-preview'
        );
        const uploadPictureBtn = document.getElementById('upload-picture-btn');
        const usernameInput = document.getElementById('username');
        const usernameAvailabilityStatus = document.getElementById(
            'username-availability-status'
        );
        let selectedProfilePicture = null;
        let isUsernameAvailable = false;

        // Profil resmi yükleme
        uploadPictureBtn.addEventListener('click', () => {
            profilePictureInput.click();
        });

        // Profil resmi önizleme
        profilePictureInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedProfilePicture = file;
                const reader = new FileReader();
                reader.onload = (event) => {
                    profilePicturePreview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Kullanıcı adı benzersizlik kontrolü
        let usernameCheckTimeout;
        usernameInput.addEventListener('input', async (e) => {
            const username = e.target.value.toLowerCase().trim();

            // Boşluk ve özel karakter kontrolü
            const usernameRegex = /^[a-z0-9_]+$/;
            if (!usernameRegex.test(username)) {
                usernameAvailabilityStatus.textContent =
                    'Kullanıcı adı sadece küçük harf, rakam ve alt çizgi içerebilir';
                usernameAvailabilityStatus.style.color = 'red';
                isUsernameAvailable = false;
                return;
            }

            // Zaman aşımı ile gereksiz çağrıları önle
            clearTimeout(usernameCheckTimeout);

            usernameCheckTimeout = setTimeout(async () => {
                if (username.length < 3) {
                    usernameAvailabilityStatus.textContent =
                        'Kullanıcı adı en az 3 karakter olmalı';
                    usernameAvailabilityStatus.style.color = 'red';
                    isUsernameAvailable = false;
                    return;
                }

                try {
                    usernameAvailabilityStatus.textContent =
                        'Kontrol ediliyor...';
                    usernameAvailabilityStatus.style.color = 'blue';

                    const available = await this.checkUsernameAvailability(
                        username
                    );

                    if (available) {
                        usernameAvailabilityStatus.textContent =
                            '✓ Kullanıcı adı uygun';
                        usernameAvailabilityStatus.style.color = 'green';
                        isUsernameAvailable = true;
                    } else {
                        usernameAvailabilityStatus.textContent =
                            '✗ Kullanıcı adı zaten alınmış';
                        usernameAvailabilityStatus.style.color = 'red';
                        isUsernameAvailable = false;
                    }
                } catch (error) {
                    usernameAvailabilityStatus.textContent = 'Bir hata oluştu';
                    usernameAvailabilityStatus.style.color = 'red';
                    isUsernameAvailable = false;
                }
            }, 500);
        });

        // Form gönderme
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Form validasyonu
            if (!isUsernameAvailable) {
                alert('Lütfen geçerli bir kullanıcı adı seçin');
                return;
            }

            const fullName = document.getElementById('full-name').value.trim();
            const username = usernameInput.value.toLowerCase().trim();
            const bio = document.getElementById('bio').value.trim();
            const gender = document.getElementById('gender').value;

            // Zorunlu alan kontrolleri
            if (!fullName || !username || !gender) {
                alert('Lütfen tüm zorunlu alanları doldurun');
                return;
            }

            try {
                const currentUser = AuthService.getCurrentUser();
                if (!currentUser) {
                    throw new Error('Kullanıcı oturumu bulunamadı');
                }

                // Profil resmi yükleme
                let profilePictureUrl = '';
                if (selectedProfilePicture) {
                    profilePictureUrl = await StorageService.uploadProfileImage(
                        selectedProfilePicture,
                        currentUser.uid
                    );
                }

                // Profil güncelleme
                await AuthService.updateUserProfile(currentUser.uid, {
                    fullName,
                    username,
                    bio,
                    gender,
                    profilePicture: profilePictureUrl,
                    isProfileComplete: true,
                });

                alert('Profil başarıyla oluşturuldu!');
                window.location.reload();
            } catch (error) {
                console.error('Profil oluşturma hatası:', error);
                alert(
                    'Profil oluşturulurken bir hata oluştu: ' + error.message
                );
            }
        });
    }
}
