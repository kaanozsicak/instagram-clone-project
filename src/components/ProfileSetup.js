import { AuthService } from '../services/auth-service.js';
import { StorageService } from '../services/storage-service.js';

export class ProfileSetup {
    static render() {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        appContainer.innerHTML = `
            <div class="profile-setup-container">
                <div class="profile-setup-form">
                    <h2>Profil Oluştur</h2>
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

                        <input 
                            type="text" 
                            id="full-name" 
                            placeholder="Ad Soyad" 
                            required
                        >
                        <div class="username-container">
                            <input 
                                type="text" 
                                id="username" 
                                placeholder="Kullanıcı Adı" 
                                required
                            >
                            <span id="username-availability-status"></span>
                        </div>
                        <textarea 
                            id="bio" 
                            placeholder="Biyografi (İsteğe bağlı)"
                        ></textarea>
                        
                        <div class="gender-select">
                            <label>Cinsiyet:</label>
                            <select id="gender">
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

            const available = await AuthService.checkUsernameAvailability(username);
            
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
        const profilePicturePreview = document.getElementById('profile-picture-preview');
        const uploadPictureBtn = document.getElementById('upload-picture-btn');
        const usernameInput = document.getElementById('username');
        const usernameAvailabilityStatus = document.getElementById('username-availability-status');
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
                usernameAvailabilityStatus.textContent = 'Kullanıcı adı sadece küçük harf, rakam ve alt çizgi içerebilir';
                usernameAvailabilityStatus.style.color = 'red';
                isUsernameAvailable = false;
                return;
            }

            // Zaman aşımı ile gereksiz çağrıları önle
            clearTimeout(usernameCheckTimeout);
            
            usernameCheckTimeout = setTimeout(async () => {
                if (username.length < 3) {
                    usernameAvailabilityStatus.textContent = 'Kullanıcı adı en az 3 karakter olmalı';
                    usernameAvailabilityStatus.style.color = 'red';
                    isUsernameAvailable = false;
                    return;
                }

                try {
                    usernameAvailabilityStatus.textContent = 'Kontrol ediliyor...';
                    usernameAvailabilityStatus.style.color = 'blue';

                    const available = await this.checkUsernameAvailability(username);
                    
                    if (available) {
                        usernameAvailabilityStatus.textContent = '✓ Kullanıcı adı uygun';
                        usernameAvailabilityStatus.style.color = 'green';
                        isUsernameAvailable = true;
                    } else {
                        usernameAvailabilityStatus.textContent = '✗ Kullanıcı adı zaten alınmış';
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
                    isProfileComplete: true
                });

                alert('Profil başarıyla oluşturuldu!');
                window.location.reload();
            } catch (error) {
                console.error('Profil oluşturma hatası:', error);
                alert('Profil oluşturulurken bir hata oluştu: ' + error.message);
            }
        });
    }
}