import { AuthService } from '../services/auth-service.js';

class CompleteProfilePage {
    static async render() {
        console.log('Profil tamamlama sayfası render ediliyor');
        const currentUser = await AuthService.ensureCurrentUser();

        if (!currentUser) {
            window.location.href = '/login';
            return;
        }

        const appContainer = document.getElementById('app');
        
        if (!appContainer) {
            console.error('App container bulunamadı');
            return;
        }

        appContainer.innerHTML = `
            <style>
                .complete-profile-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #fafafa;
                    font-family: 'Arial', sans-serif;
                }
                .complete-profile-wrapper {
                    background-color: white;
                    border: 1px solid #dbdbdb;
                    border-radius: 10px;
                    width: 100%;
                    max-width: 400px;
                    padding: 30px;
                    text-align: center;
                }
                .profile-image-upload {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    background-color: #e1e1e1;
                    margin: 0 auto 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    overflow: hidden;
                }
                .profile-image-upload img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: cover;
                }
                .complete-profile-form input {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 15px;
                    border: 1px solid #dbdbdb;
                    border-radius: 5px;
                }
                .complete-profile-form button {
                    width: 100%;
                    padding: 12px;
                    background-color: #0095f6;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
            </style>
            <div class="complete-profile-container">
                <div class="complete-profile-wrapper">
                    <div class="profile-image-upload" id="profile-image-upload">
                        <img id="profile-image-preview" src="" alt="Profil Resmi" style="display: none;">
                        <span id="upload-text">Profil Resmi Yükle</span>
                    </div>
                    <input type="file" id="profile-image-input" style="display: none;" accept="image/*">
                    <form id="complete-profile-form" class="complete-profile-form">
                        <input 
                            type="text" 
                            id="username" 
                            placeholder="Kullanıcı Adı" 
                            required
                        >
                        <input 
                            type="text" 
                            id="fullName" 
                            placeholder="Ad Soyad" 
                            required
                        >
                        <input 
                            type="text" 
                            id="bio" 
                            placeholder="Biyografi (İsteğe Bağlı)" 
                        >
                        <button type="submit">Profili Tamamla</button>
                    </form>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    static setupEventListeners() {
        const profileImageUpload = document.getElementById('profile-image-upload');
        const profileImageInput = document.getElementById('profile-image-input');
        const profileImagePreview = document.getElementById('profile-image-preview');
        const uploadText = document.getElementById('upload-text');
        const completeProfileForm = document.getElementById('complete-profile-form');

        profileImageUpload.addEventListener('click', () => {
            profileImageInput.click();
        });

        profileImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    profileImagePreview.src = event.target.result;
                    profileImagePreview.style.display = 'block';
                    uploadText.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        completeProfileForm.addEventListener('submit', this.handleProfileCompletion.bind(this));
    }

    static async handleProfileCompletion(e) {
        e.preventDefault();
        
        const currentUser = await AuthService.ensureCurrentUser();

        if (!currentUser) {
            window.location.href = '/login';
            return;
        }

        const usernameInput = document.getElementById('username');
        const fullNameInput = document.getElementById('fullName');
        const bioInput = document.getElementById('bio');
        const profileImageInput = document.getElementById('profile-image-input');

        const username = usernameInput.value.trim();
        const fullName = fullNameInput.value.trim();
        const bio = bioInput.value.trim();
        const profileImage = profileImageInput.files[0];

        try {
            // Kullanıcı adı kontrolü
            const isUsernameAvailable = await AuthService.checkUsernameAvailability(username);
            
            if (!isUsernameAvailable) {
                alert('Bu kullanıcı adı zaten kullanımda');
                return;
            }

            const profileData = {
                username: username.toLowerCase(),
                fullName, // Boş olmaması gerekiyor
                bio: bio || '',
                isProfileComplete: true
            };

            // Profil bilgilerini güncelle
            await AuthService.updateUserProfile(currentUser.uid, profileData, profileImage);

            // Ana sayfaya yönlendir
            window.location.href = '/home';

        } catch (error) {
            console.error('Profil tamamlama hatası:', error);
            alert(error.message || 'Profil güncellenemedi');
        }
    }
}

export default CompleteProfilePage;