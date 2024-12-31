import { AuthService } from '../services/auth-service.js';
import { StorageService } from '../services/storage-service.js';

export class ProfileEdit {
    static render(currentUser) {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        const profile = currentUser.profile || {};

        appContainer.innerHTML = `
            <div class="profile-edit-container">
                <div class="profile-edit-form">
                    <h2>Profili Düzenle</h2>
                    <form id="profile-edit-form">
                        <div class="profile-picture-upload">
                            <input 
                                type="file" 
                                id="profile-picture" 
                                accept="image/*"
                                style="display:none;"
                            >
                            <img 
                                id="profile-picture-preview" 
                                src="${profile.profilePicture || 'https://via.placeholder.com/150'}" 
                                alt="Profil Resmi"
                            >
                            <button 
                                type="button" 
                                id="upload-picture-btn"
                                class="upload-btn"
                            >
                                Profil Resmini Değiştir
                            </button>
                        </div>

                        <input 
                            type="text" 
                            id="full-name" 
                            placeholder="Ad Soyad" 
                            value="${profile.fullName || ''}"
                            required
                        >
                        <div class="username-container">
                            <input 
                                type="text" 
                                id="username" 
                                placeholder="Kullanıcı Adı" 
                                value="${profile.username || ''}"
                                required
                            >
                            <span id="username-availability-status"></span>
                        </div>
                        <textarea 
                            id="bio" 
                            placeholder="Biyografi (İsteğe bağlı)"
                        >${profile.bio || ''}</textarea>
                        
                        <div class="gender-select">
                            <label>Cinsiyet:</label>
                            <select id="gender">
                                <option value="">Seçiniz</option>
                                <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>Erkek</option>
                                <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>Kadın</option>
                                <option value="other" ${profile.gender === 'other' ? 'selected' : ''}>Diğer</option>
                            </select>
                        </div>

                        <button type="submit" class="submit-btn">Profili Güncelle</button>
                    </form>
                </div>
            </div>
        `;

        this.setupEventListeners(currentUser);
    }

    static setupEventListeners(currentUser) {
        const form = document.getElementById('profile-edit-form');
        const profilePictureInput = document.getElementById('profile-picture');
        const profilePicturePreview = document.getElementById('profile-picture-preview');
        const uploadPictureBtn = document.getElementById('upload-picture-btn');
        const usernameInput = document.getElementById('username');
        const usernameAvailabilityStatus = document.getElementById('username-availability-status');
        
        let selectedProfilePicture = null;
        let isUsernameAvailable = true;

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
            
            // Mevcut kullanıcı adını kontrol et
            if (username === currentUser.profile.username) {
                usernameAvailabilityStatus.textContent = '✓ Mevcut kullanıcı adı';
                usernameAvailabilityStatus.style.color = 'green';
                isUsernameAvailable = true;
                return;
            }

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

                    const available = await AuthService.checkUsernameAvailability(username);
                    
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
                const currentUserAuth = AuthService.getCurrentUser();
                if (!currentUserAuth) {
                    throw new Error('Kullanıcı oturumu bulunamadı');
                }

                // Profil resmi yükleme
                let profilePictureUrl = currentUser.profile.profilePicture;
                if (selectedProfilePicture) {
                    profilePictureUrl = await StorageService.uploadProfileImage(
                        selectedProfilePicture, 
                        currentUserAuth.uid
                    );
                }

                // Profil güncelleme
                await AuthService.updateUserProfile(currentUserAuth.uid, {
                    fullName,
                    username,
                    bio,
                    gender,
                    profilePicture: profilePictureUrl,
                    isProfileComplete: true
                });

                alert('Profil başarıyla güncellendi!');
                window.location.reload();
            } catch (error) {
                console.error('Profil güncelleme hatası:', error);
                alert('Profil güncellenirken bir hata oluştu: ' + error.message);
            }
        });
    }
}