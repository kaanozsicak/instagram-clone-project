import { AuthService } from '../services/auth-service.js';
import { PostService } from '../services/post-service.js';
import { UserService } from '../services/user-service.js';

export class ProfileComponent {
    static async render() {
        const profileModalContainer = document.getElementById('profile-modal');
        const user = await AuthService.getCurrentUser();
        const userPosts = await PostService.fetchUserPosts(user.uid);

        profileModalContainer.innerHTML = `
            <div class="modal-content profile-modal">
                <div class="profile-header">
                    <div class="profile-image-container">
                        <img 
                            src="${user.profileImage || '/default-avatar.png'}" 
                            alt="Profil Resmi" 
                            class="profile-avatar"
                        >
                        <input 
                            type="file" 
                            id="profile-image-upload" 
                            accept="image/*" 
                            style="display:none;"
                        >
                        <button id="change-profile-image">Profil Resmini Değiştir</button>
                    </div>

                    <div class="profile-info">
                        <h2>${user.username}</h2>
                        <textarea 
                            id="profile-bio" 
                            placeholder="Biyografinizi ekleyin"
                        >${user.bio || ''}</textarea>

                        <div class="profile-stats">
                            <span>${userPosts.length} Gönderi</span>
                            <span>${user.followers?.length || 0} Takipçi</span>
                            <span>${user.following?.length || 0} Takip</span>
                        </div>

                        <div class="profile-actions">
                            <button id="save-profile">Profili Kaydet</button>
                            <button id="logout-btn">Çıkış Yap</button>
                        </div>
                    </div>
                </div>

                <div class="profile-posts">
                    ${userPosts.map(post => `
                        <div class="profile-post">
                            <img src="${post.imageUrl}" alt="Gönderi">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    static setupEventListeners() {
        const profileImageUpload = document.getElementById('profile-image-upload');
        const changeProfileImageBtn = document.getElementById('change-profile-image');
        const saveProfileBtn = document.getElementById('save-profile');
        const logoutBtn = document.getElementById('logout-btn');
        const profileBio = document.getElementById('profile-bio');

        // Profil resmi değiştirme
        changeProfileImageBtn.addEventListener('click', () => {
            profileImageUpload.click();
        });

        profileImageUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    // Profil resmi yükleme işlevi eklenecek
                    console.log('Profil resmi yüklenecek');
                } catch (error) {
                    console.error('Profil resmi yükleme hatası:', error);
                }
            }
        });

        // Profili kaydetme
        saveProfileBtn.addEventListener('click', async () => {
            try {
                await UserService.updateProfile({
                    bio: profileBio.value
                });
                alert('Profil güncellendi');
            } catch (error) {
                console.error('Profil güncelleme hatası:', error);
                alert('Profil güncellenirken bir hata oluştu');
            }
        });

        // Çıkış yapma
        logoutBtn.addEventListener('click', async () => {
            try {
                await AuthService.logout();
                // Çıkış yapıldıktan sonra auth modalını göster
                document.getElementById('auth-modal').style.display = 'block';
            } catch (error) {
                console.error('Çıkış hatası:', error);
            }
        });
    }
}