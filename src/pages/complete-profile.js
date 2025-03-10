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
                <!-- profil tamamlama formu HTML'i -->
                <!-- ...existing code... -->
                <style>
                    .complete-profile-container {
                        max-width: 500px;
                        margin: 0 auto;
                        padding: 2rem;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        background-color: #fff;
                    }
                    h1 {
                        text-align: center;
                        margin-bottom: 1.5rem;
                    }
                    .form-group {
                        margin-bottom: 1rem;
                    }
                    label {
                        display: block;
                        margin-bottom: 0.5rem;
                        font-weight: 500;
                    }
                    input, textarea {
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    button {
                        background-color: #0095f6;
                        color: white;
                        border: none;
                        padding: 0.75rem 1rem;
                        border-radius: 4px;
                        cursor: pointer;
                        width: 100%;
                        margin-top: 1rem;
                    }
                </style>
                <div class="complete-profile-container">
                    <h1>Profilinizi Tamamlayın</h1>
                    <form id="profile-form">
                        <div class="form-group">
                            <label for="username">Kullanıcı Adı*</label>
                            <input type="text" id="username" required>
                        </div>
                        <div class="form-group">
                            <label for="fullName">Adınız Soyadınız*</label>
                            <input type="text" id="fullName" required>
                        </div>
                        <div class="form-group">
                            <label for="bio">Biyografi</label>
                            <textarea id="bio" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="profileImage">Profil Fotoğrafı</label>
                            <input type="file" id="profileImage" accept="image/*">
                        </div>
                        <button type="submit">Profili Kaydet</button>
                    </form>
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

                // Validasyonlar
                if (!username || username.length < 3) {
                    alert('Kullanıcı adı en az 3 karakter olmalıdır');
                    return;
                }

                if (!fullName) {
                    alert('Adınızı ve soyadınızı girmelisiniz');
                    return;
                }

                const currentUser = AuthService.getCurrentUser();
                if (!currentUser) {
                    alert('Oturum açık değil');
                    window.location.replace('/login');
                    return;
                }

                // Kullanıcı adının uygunluğunu kontrol et
                const isAvailable = await AuthService.checkUsernameAvailability(
                    username
                );
                if (!isAvailable) {
                    alert('Bu kullanıcı adı zaten kullanılıyor');
                    return;
                }

                // Profil bilgilerini güncelle
                await AuthService.updateUserProfile(
                    currentUser.uid,
                    {
                        username: username.toLowerCase(),
                        fullName,
                        bio,
                        isProfileComplete: true,
                    },
                    profileImage
                );

                alert('Profiliniz başarıyla oluşturuldu!');
                window.location.replace('/home');
            } catch (error) {
                console.error('Profil kaydetme hatası:', error);
                alert(`Profil kaydedilirken bir hata oluştu: ${error.message}`);
            }
        });
    }
}

export default CompleteProfilePage;
