import { AuthService } from '../services/auth-service.js';
import { SearchService } from '../services/search-service.js';
import { PostService } from '../services/post-service.js';
import { UserService } from '../services/user-service.js';

class HomePage {
    static async render() {
        console.log('HomePage render başladı');
        try {
            const authUser = await AuthService.ensureCurrentUser();
            console.log('Auth user:', authUser);

            if (!authUser) {
                console.log(
                    'Kullanıcı oturumu yok, login sayfasına yönlendiriliyor'
                );
                window.location.href = '/login';
                return;
            }

            // Kullanıcının tam profil bilgilerini ayrıca yükleyelim
            const currentUserProfile = await AuthService.getUserProfile(
                authUser.uid
            );
            console.log('Complete user profile:', currentUserProfile);

            // Profil bilgisi yoksa oluşturalım
            const userProfile = currentUserProfile || {
                username: 'kullanici',
                fullName: '',
                profilePicture:
                    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4=',
            };

            const appContainer = document.getElementById('app');
            if (!appContainer) {
                console.error('App container bulunamadı');
                return;
            }

            // Öneri olarak gösterilecek kullanıcıları getir
            const suggestedUsers = await UserService.getSuggestedUsers(
                authUser.uid,
                3
            );

            // Önerilen kullanıcılar için HTML oluştur
            const suggestedUsersHTML =
                suggestedUsers.length > 0
                    ? suggestedUsers
                          .map(
                              (user) => `
                    <div class="suggestion-item">
                        <div class="suggestion-user">
                            <img src="${
                                user.profileImage ||
                                user.profilePicture ||
                                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                            }" alt="${user.username}">
                            <div class="suggestion-user-info">
                                <h4>${user.username}</h4>
                                <p>${user.fullName || ''}</p>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-sm follow-suggestion-btn" data-username="${
                            user.username
                        }">Takip Et</button>
                    </div>
                `
                          )
                          .join('')
                    : '<p style="text-align: center; padding: 15px; color: var(--text-secondary);">Şu anda öneri bulunmuyor</p>';

            // Hikayeler için HTML oluştur - Bu kısım eksikti
            const storiesHTML = `
                <div class="story-item">
                    <img src="${
                        userProfile.profilePicture ||
                        userProfile.profileImage ||
                        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                    }" alt="${userProfile.username}">
                    <span>${userProfile.username}</span>
                </div>
                <div class="story-item">
                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4=" alt="Kullanıcı 1">
                    <span>user1</span>
                </div>
                <div class="story-item">
                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4=" alt="Kullanıcı 2">
                    <span>user2</span>
                </div>
                <div class="story-item">
                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4=" alt="Kullanıcı 3">
                    <span>user3</span>
                </div>
            `;

            // Sayfayı oluştur
            appContainer.innerHTML = `
            <link rel="stylesheet" href="./src/styles/ui-components.css">
            
            <style>
                .home-container {
                    max-width: 1140px;
                    margin: 0 auto;
                    padding: 20px;
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 30px;
                }
                
                @media (max-width: 1140px) {
                    .home-container {
                        grid-template-columns: 1fr;
                        max-width: 600px;
                    }
                    
                    .sidebar {
                        display: none;
                    }
                }
                
                @media (max-width: 600px) {
                    .home-container {
                        padding: 0;
                    }
                    
                    .post-card {
                        border-radius: 0;
                        margin-bottom: 20px;
                    }
                }
                
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    background: var(--card-color);
                    border-bottom: 1px solid var(--border-color);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    box-shadow: var(--shadow-sm);
                }
                
                .logo {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--primary-color);
                    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .search-bar {
                    position: relative;
                    width: 300px;
                }
                
                @media (max-width: 768px) {
                    .search-bar {
                        width: 200px;
                    }
                }
                
                @media (max-width: 576px) {
                    .search-bar {
                        width: 150px;
                    }
                }
                
                .search-bar input {
                    width: 100%;
                    padding: 10px 15px;
                    border-radius: 20px;
                    border: 1px solid var(--border-color);
                    background: var(--gray-100);
                    font-size: 14px;
                }
                
                .search-bar input:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.1);
                    background: #fff;
                }
                
                .search-results {
                    position: absolute;
                    top: 45px;
                    left: 0;
                    width: 300px;
                    background: var(--card-color);
                    border-radius: 8px;
                    box-shadow: var(--shadow-lg);
                    z-index: 10;
                    max-height: 400px;
                    overflow-y: auto;
                    display: none;
                }
                
                .main-content {
                    width: 100%;
                }
                
                .stories-section {
                    margin-bottom: 25px;
                    background: var(--card-color);
                    border-radius: 10px;
                    padding: 15px;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--gray-200);
                    position: relative;
                    overflow: hidden;
                }
                
                .stories-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 5px;
                    height: 100%;
                    background: linear-gradient(to bottom, var(--primary-color), var(--secondary-color));
                }
                
                .stories-container {
                    display: flex;
                    overflow-x: auto;
                    gap: 15px;
                    padding: 5px 0;
                    scrollbar-width: none;
                }
                
                .stories-container::-webkit-scrollbar {
                    display: none;
                }
                
                .posts-section {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .post-card {
                    background: var(--card-color);
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--gray-200);
                    transition: box-shadow 0.2s, transform 0.2s;
                }
                
                .post-card:hover {
                    box-shadow: var(--shadow-md);
                    transform: translateY(-2px);
                }
                
                .post-header {
                    display: flex;
                    align-items: center;
                    padding: 12px 15px;
                    border-bottom: 1px solid var(--gray-100);
                }
                
                .post-header img {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                    margin-right: 12px;
                    border: 2px solid var(--primary-light);
                }
                
                .post-username {
                    font-weight: 600;
                    margin-bottom: 2px;
                    color: var(--text-primary);
                }
                
                .post-time {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                
                .post-image-container {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #000;
                }
                
                .post-image {
                    width: 100%;
                    max-height: 600px;
                    object-fit: contain;
                }
                
                .post-actions {
                    display: flex;
                    padding: 12px 15px;
                    border-top: 1px solid var(--gray-100);
                }
                
                .post-action-btn {
                    background: none;
                    border: none;
                    padding: 8px 12px;
                    margin-right: 12px;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    transition: all 0.2s;
                    border-radius: 8px;
                }
                
                .post-action-btn:hover {
                    background-color: var(--gray-100);
                }
                
                .post-action-btn i {
                    font-size: 18px;
                    margin-right: 6px;
                }
                
                .post-action-btn.liked {
                    color: #e74c3c;
                }
                
                .post-action-btn.liked i {
                    color: #e74c3c;
                }
                
                .post-likes {
                    padding: 0 15px 8px 15px;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .post-caption {
                    padding: 0 15px 12px 15px;
                    color: var(--text-primary);
                }
                
                .post-comments-section {
                    padding: 0 15px 12px 15px;
                    border-bottom: 1px solid var(--gray-100);
                }
                
                .post-comment {
                    margin-bottom: 6px;
                }
                
                .post-comment-username {
                    font-weight: 600;
                    margin-right: 5px;
                }
                
                .post-add-comment {
                    display: flex;
                    padding: 12px 15px;
                }
                
                .post-comment-input {
                    flex: 1;
                    border: none;
                    padding: 8px 0;
                    outline: none;
                    color: var(--text-primary);
                    background: transparent;
                }
                
                .post-comment-submit {
                    border: none;
                    background: none;
                    color: var(--primary-color);
                    font-weight: 600;
                    cursor: pointer;
                }
                
                .post-comment-submit:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .sidebar {
                    position: sticky;
                    top: 85px;
                }
                
                .user-profile {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    margin-bottom: 20px;
                    background: var(--card-color);
                    border-radius: 10px;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--gray-200);
                }
                
                .user-profile img {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    margin-right: 15px;
                    object-fit: cover;
                    border: 3px solid var(--primary-light);
                }
                
                .user-profile-info h3 {
                    margin: 0;
                    color: var(--text-primary);
                }
                
                .user-profile-info p {
                    margin: 0;
                    color: var(--text-secondary);
                }
                
                .suggestions-container {
                    background: var(--card-color);
                    border-radius: 10px;
                    padding: 15px;
                    box-shadow: var (--shadow-sm);
                    border: 1px solid var(--gray-200);
                    position: relative;
                    overflow: hidden;
                }
                
                .suggestions-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 5px;
                    height: 100%;
                    background: linear-gradient(to bottom, var(--secondary-color), var(--primary-color));
                }
                
                .suggestions-title {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    color: var(--text-primary);
                }
                
                .suggestion-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid var(--gray-100);
                }
                
                .suggestion-user {
                    display: flex;
                    align-items: center;
                }
                
                .suggestion-user img {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    margin-right: 10px;
                    object-fit: cover;
                    border: 2px solid var(--gray-300);
                }
                
                .suggestion-user-info h4 {
                    margin: 0;
                    font-size: 14px;
                    color: var(--text-primary);
                }
                
                .suggestion-user-info p {
                    margin: 0;
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                
                .story-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                }
                
                .story-item img {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid transparent;
                    background-image: linear-gradient(#fff, #fff), 
                                      linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    background-origin: border-box;
                    background-clip: content-box, border-box;
                    margin-bottom: 6px;
                }
                
                .story-item span {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-primary);
                    max-width: 70px;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                    text-align: center;
                }
                
                .nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .nav-item {
                    position: relative;
                }
                
                .notification-dot {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 8px;
                    height: 8px;
                    background-color: var(--error-color);
                    border-radius: 50%;
                }
                
                .new-post-btn {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    border-radius: 50%;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    box-shadow: var(--shadow-lg);
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                    z-index: 99;
                }
                
                .new-post-btn:hover {
                    transform: scale(1.05) translateY(-5px);
                    box-shadow: var(--shadow-xl);
                }
                
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 50px 0;
                }
                
                .loading-container .spinner {
                    margin-bottom: 15px;
                }
            </style>
            
            <!-- Header -->
            <header class="header">
                <div class="logo">Photogram</div>
                
                <div class="search-bar">
                    <input type="text" id="search-input" placeholder="Kullanıcı ara...">
                    <div class="search-results" id="search-results"></div>
                </div>
                
                <div class="nav-actions">
                    <div class="nav-item">
                        <button id="home-btn" class="btn btn-ghost btn-icon" title="Ana Sayfa">
                            <i class="fas fa-home"></i>
                        </button>
                    </div>
                    
                    <div class="nav-item">
                        <button id="messages-btn" class="btn btn-ghost btn-icon" title="Mesajlar">
                            <i class="far fa-paper-plane"></i>
                            <span id="messages-badge" class="badge badge-danger badge-dot" style="display: none;"></span>
                        </button>
                    </div>
                    
                    <div class="nav-item">
                        <button id="notification-btn" class="btn btn-ghost btn-icon" title="Bildirimler">
                            <i class="far fa-heart"></i>
                            <span id="notification-count" class="badge badge-danger badge-dot" style="display: none;"></span>
                        </button>
                        
                        <div id="notification-panel" class="notifications-menu" style="display: none;">
                            <div class="notifications-header">
                                <h3 style="margin: 0; font-size: 16px;">Bildirimler</h3>
                            </div>
                            <div id="notifications-list" class="notifications-list"></div>
                        </div>
                    </div>
                    
                    <div class="nav-item">
                        <button id="profile-link" class="btn btn-ghost btn-icon" title="Profil">
                            <img src="${
                                userProfile.profileImage ||
                                userProfile.profilePicture ||
                                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                            }" 
                            alt="Profile" 
                            style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-light);">
                        </button>
                    </div>
                    
                    <div class="nav-item">
                        <button id="logout-button" class="btn btn-ghost btn-icon" title="Çıkış Yap">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </header>
            
            <div class="home-container">
                <section class="main-content">
                    <div class="stories-section">
                        <div class="stories-container">
                            ${storiesHTML}
                        </div>
                    </div>
                    
                    <section class="posts-section">
                        <div id="initial-loading" class="loading-container">
                            <div class="spinner spinner-lg"></div>
                            <p>Gönderiler yükleniyor...</p>
                        </div>
                        <div id="posts-container"></div>
                        <div id="load-more-container" style="display: none; text-align: center; padding: 20px;">
                            <button class="btn btn-light load-more-btn">
                                <span class="spinner spinner-sm" style="margin-right: 8px; display: none;"></span>
                                Daha Fazla Göster
                            </button>
                        </div>
                    </section>
                </section>
                
                <aside class="sidebar">
                    <div class="user-profile">
                        <img src="${
                            userProfile.profileImage ||
                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                        }" alt="${userProfile.username}">
                        <div class="user-profile-info">
                            <h3>${userProfile.username}</h3>
                            <p>${userProfile.fullName || ''}</p>
                        </div>
                    </div>
                    
                    <div class="suggestions-container">
                        <div class="suggestions-title">
                            <strong>Senin İçin Öneriler</strong>
                            <a href="#" style="color: var(--primary-color); font-size: 14px; text-decoration: none;">Tümünü Gör</a>
                        </div>
                        
                        ${suggestedUsersHTML}
                    </div>
                </aside>
            </div>
            
            <button class="new-post-btn" title="Yeni Gönderi">
                <i class="fas fa-plus"></i>
            </button>
        `;

            // Event listener'ları ayarla
            this.setupEventListeners();

            // Gönderileri yükle
            this.loadPosts();
        } catch (error) {
            console.error('HomePage render error:', error);
            // Hata durumunda kullanıcıyı bilgilendir
            const appContainer = document.getElementById('app');
            if (appContainer) {
                appContainer.innerHTML = `
                    <div style="text-align: center; padding: 50px; color: red;">
                        <h2>Sayfa yüklenirken bir hata oluştu</h2>
                        <p>${error.message}</p>
                        <button onclick="window.location.reload()">Yeniden Dene</button>
                    </div>
                `;
            }
        }
    }

    // Kaydırma algılama ve yeni gönderileri yükleme için değişkenler
    static lastVisiblePost = null;
    static isLoading = false;
    static allPostsLoaded = false;
    static postsPerPage = 5; // İlk yüklemede gösterilecek gönderi sayısı

    static async setupEventListeners() {
        console.log("Event listener'lar ayarlanıyor");

        // Profil butonuna tıklama
        document.getElementById('profile-link').onclick = async (e) => {
            e.preventDefault();
            console.log('Profil butonuna tıklandı');

            try {
                const currentUser = AuthService.getCurrentUser();
                if (!currentUser) {
                    throw new Error('Kullanıcı oturumu bulunamadı');
                }

                const userProfile = await AuthService.getUserProfile(
                    currentUser.uid
                );
                console.log('Kullanıcı profili:', userProfile);

                if (userProfile && userProfile.username) {
                    console.log(
                        `/profile/${userProfile.username} adresine yönlendiriliyor`
                    );
                    window.location.href = `/profile/${userProfile.username}`;
                } else {
                    console.log(
                        'Kullanıcı adı bulunamadı, profil ekleme sayfasına yönlendiriliyor'
                    );
                    window.location.href = '/complete-profile';
                }
            } catch (error) {
                console.error('Profil yönlendirme hatası:', error);
                alert('Profil sayfasına gidilemedi: ' + error.message);
            }
        };

        // Çıkış butonuna tıklama
        document.getElementById('logout-button').onclick = () => {
            console.log('Çıkış butonuna tıklandı');

            if (confirm('Çıkış yapmak istiyor musunuz?')) {
                try {
                    AuthService.logout()
                        .then(() => {
                            console.log(
                                'Çıkış başarılı, login sayfasına yönlendiriliyor'
                            );
                            window.location.href = '/login';
                        })
                        .catch((err) => {
                            console.error('Çıkış hatası:', err);
                            alert('Çıkış yapılırken bir hata oluştu');
                        });
                } catch (error) {
                    console.error('Çıkış hatası:', error);
                    alert('Çıkış yapılırken bir hata oluştu');
                }
            }
        };

        // Arama
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');

        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim();

            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            try {
                // SearchService'i kullanarak kullanıcı ara
                const users = await SearchService.searchUsers(query);

                if (users.length === 0) {
                    searchResults.innerHTML = `<div class="search-result-item">Kullanıcı bulunamadı</div>`;
                } else {
                    searchResults.innerHTML = users
                        .map(
                            (user) => `
                        <div class="search-result-item" data-username="${
                            user.username
                        }">
                            <img src="${
                                user.profilePicture ||
                                user.profileImage ||
                                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                            }" 
                                 alt="${
                                     user.username
                                 }" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
                            <div>
                                <div><strong>@${user.username}</strong></div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${
                                    user.fullName || ''
                                }</div>
                            </div>
                        </div>
                    `
                        )
                        .join('');

                    // Sonuçlara tıklama olayı ekle
                    document
                        .querySelectorAll('.search-result-item')
                        .forEach((item) => {
                            item.addEventListener('click', () => {
                                const username = item.dataset.username;
                                window.location.href = `/profile/${username}`;
                            });
                        });
                }

                searchResults.style.display = 'block';
            } catch (error) {
                console.error('Arama hatası:', error);
                searchResults.innerHTML = `<div class="search-result-item">Arama sırasında bir hata oluştu</div>`;
                searchResults.style.display = 'block';
            }
        });

        // Arama sonuçlarını dışarı tıklanınca kapat
        document.addEventListener('click', (e) => {
            if (
                !searchInput.contains(e.target) &&
                !searchResults.contains(e.target)
            ) {
                searchResults.style.display = 'none';
            }
        });

        // Bildirim butonu ve paneli
        const notificationBtn = document.getElementById('notification-btn');
        const notificationPanel = document.getElementById('notification-panel');
        const notificationCount = document.getElementById('notification-count');
        const notificationsList = document.getElementById('notifications-list');

        if (notificationBtn && notificationPanel) {
            // Bildirim butonu tıklaması
            notificationBtn.addEventListener('click', async () => {
                const isVisible = notificationPanel.style.display === 'block';
                notificationPanel.style.display = isVisible ? 'none' : 'block';

                // Panel açıldığında bildirimleri yükle
                if (!isVisible) {
                    await this.loadNotifications(notificationsList);
                }
            });

            // Dışarı tıklandığında bildirim panelini kapat
            document.addEventListener('click', (e) => {
                if (
                    !notificationBtn.contains(e.target) &&
                    !notificationPanel.contains(e.target)
                ) {
                    notificationPanel.style.display = 'none';
                }
            });

            // Bildirimleri periyodik olarak kontrol et
            this.loadNotifications(notificationsList, notificationCount);
            setInterval(() => {
                this.loadNotifications(notificationsList, notificationCount);
            }, 60000); // Her dakika kontrol et
        }

        // Öneri kullanıcılarını takip et
        document
            .querySelectorAll('.follow-suggestion-btn')
            .forEach((button) => {
                button.addEventListener('click', async () => {
                    const username = button.getAttribute('data-username');
                    button.textContent = 'Takip Ediliyor...';
                    button.disabled = true;
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-light');

                    try {
                        await this.followUser(username);
                        button.textContent = 'Takip Ediliyor';
                    } catch (error) {
                        console.error(
                            `${username} kullanıcısını takip hatası:`,
                            error
                        );
                        button.textContent = 'Tekrar Dene';
                        button.disabled = false;
                        button.classList.remove('btn-light');
                        button.classList.add('btn-primary');
                    }
                });
            });

        // Yeni gönderi oluşturma butonu
        const newPostBtn = document.querySelector('.new-post-btn');
        if (newPostBtn) {
            newPostBtn.addEventListener('click', () => {
                this.openPostCreationModal();
            });
        }

        // Sonsuz kaydırma için scroll event listener ekle
        window.addEventListener('scroll', () => {
            if (this.isLoading || this.allPostsLoaded) return;

            const { scrollTop, scrollHeight, clientHeight } =
                document.documentElement;

            // Sayfa sonuna yaklaştığında yeni gönderiler yükle (sayfa sonuna 200px kala)
            if (scrollTop + clientHeight >= scrollHeight - 200) {
                this.loadMorePosts();
            }
        });

        // Mesajlar butonu
        document
            .getElementById('messages-btn')
            .addEventListener('click', () => {
                window.location.href = '/messages';
            });

        // Okunmamış mesajları kontrol et
        this.checkUnreadMessages();
    }

    static async followUser(username) {
        try {
            // FollowService'i dinamik import et
            const { FollowService } = await import(
                '../services/follow-service.js'
            );
            return await FollowService.followUser(username);
        } catch (error) {
            console.error('Takip etme hatası:', error);
            throw error;
        }
    }

    static async loadPosts(isInitialLoad = true) {
        console.log('Gönderiler yükleniyor');
        const postsContainer = document.getElementById('posts-container');
        const loadMoreContainer = document.getElementById(
            'load-more-container'
        );
        const initialLoading = document.getElementById('initial-loading');

        if (this.isLoading) return;
        this.isLoading = true;

        try {
            // İlk yükleme ise önceki gönderileri temizle
            if (isInitialLoad) {
                postsContainer.innerHTML = '';
                this.lastVisiblePost = null;
                this.allPostsLoaded = false;
            }

            // Gönderileri yükle
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // Posts'ları getir
            const posts = await PostService.getFollowedUsersPosts(
                this.postsPerPage,
                this.lastVisiblePost
            );

            // Güvenli bir şekilde loading elementini kaldır
            if (initialLoading) {
                // Parent kontrolü yapalım
                if (initialLoading.parentNode) {
                    initialLoading.parentNode.removeChild(initialLoading);
                } else {
                    // Parent yoksa görünürlüğü gizleyelim
                    initialLoading.style.display = 'none';
                }
            }

            // Son gönderiyi kaydet (pagination için)
            if (posts.length > 0) {
                this.lastVisiblePost = posts[posts.length - 1].id;
            }

            // Tüm gönderiler yüklendi mi kontrol et
            if (posts.length < this.postsPerPage) {
                this.allPostsLoaded = true;
            }

            // Boş durumu kontrol et
            if (posts.length === 0 && isInitialLoad) {
                postsContainer.innerHTML = `
                    <div class="empty-state" style="text-align: center; padding: 40px;">
                        <div style="font-size: 72px; margin-bottom: 20px;">📷</div>
                        <h3>Henüz gönderi yok</h3>
                        <p style="color: var(--text-secondary);">Takip ettiğiniz kişiler gönderi paylaştığında burada görünecek.</p>
                        <button class="btn btn-primary" style="margin-top: 20px;" id="explore-users-btn">
                            Keşfet
                        </button>
                    </div>
                `;

                // Explore butonu
                const exploreBtn = document.getElementById('explore-users-btn');
                if (exploreBtn) {
                    exploreBtn.addEventListener('click', () => {
                        // Keşfet sayfasına yönlendir
                        // Bu kısım geliştirilebilir
                        alert('Keşfet özelliği yapım aşamasında!');
                    });
                }
            } else if (posts.length > 0) {
                // HTML gösterim formatını düzenle
                const postsHTML = posts
                    .map(
                        (post) => `
                    <article class="post-card" data-post-id="${post.id}">
                        <div class="post-header">
                            <img src="${post.profileImage}" alt="${
                            post.username
                        }" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 10px;">
                            <div class="post-user-info">
                                <div class="post-username">${
                                    post.username
                                }</div>
                                <div class="post-time">${this.formatPostTime(
                                    post.createdAt
                                )}</div>
                            </div>
                        </div>
                        
                        <div class="post-image-container">
                            <img class="post-image" src="${
                                post.imageUrl
                            }" alt="Post by ${post.username}">
                        </div>
                        
                        <div class="post-actions">
                            <button class="post-action-btn like-button ${
                                post.likedByMe ? 'liked' : ''
                            }" data-post-id="${post.id}">
                                <i class="${
                                    post.likedByMe ? 'fas' : 'far'
                                } fa-heart"></i>
                                <span>${post.likes || 0}</span>
                            </button>
                            <button class="post-action-btn">
                                <i class="far fa-comment"></i>
                                <span>${post.comments?.length || 0}</span>
                            </button>
                            <button class="post-action-btn share-post-button" data-id="${
                                post.id
                            }" title="Gönderiyi paylaş">
                                <i class="far fa-paper-plane"></i>
                            </button>
                        </div>
                        
                        <div class="post-likes">
                            <span>${post.likes || 0} beğenme</span>
                        </div>
                        
                        <div class="post-caption">
                            <strong>${post.username}</strong> ${
                            post.caption || ''
                        }
                        </div>
                        
                        <div class="post-comments-section">
                            ${
                                post.comments
                                    ? this.renderPostComments(
                                          post.comments.slice(0, 2)
                                      )
                                    : ''
                            }
                            ${
                                post.comments && post.comments.length > 2
                                    ? `<div style="margin-top: 8px; font-size: 14px; color: var(--text-secondary);">${
                                          post.comments.length - 2
                                      } yorum daha...</div>`
                                    : ''
                            }
                        </div>
                        
                        <div class="post-add-comment">
                            <input type="text" class="post-comment-input" id="comment-input-${
                                post.id
                            }" placeholder="Yorum yaz...">
                            <button class="post-comment-submit send-comment-btn" data-post-id="${
                                post.id
                            }" disabled>Paylaş</button>
                        </div>
                    </article>
                `
                    )
                    .join('');

                // İlk yüklemedeyse içeriği değiştir, değilse ekle
                if (isInitialLoad) {
                    postsContainer.innerHTML = postsHTML;
                } else {
                    postsContainer.insertAdjacentHTML('beforeend', postsHTML);
                }

                // Daha fazla göster butonunu görünür yap
                if (!this.allPostsLoaded) {
                    loadMoreContainer.style.display = 'block';

                    // Yükleme butonu işaretleyiciyi kaldır
                    const loadingSpinner =
                        loadMoreContainer.querySelector('.spinner');
                    if (loadingSpinner) {
                        loadingSpinner.style.display = 'none';
                    }

                    // Butonu aktif et
                    const loadMoreBtn =
                        loadMoreContainer.querySelector('.load-more-btn');
                    if (loadMoreBtn) {
                        loadMoreBtn.disabled = false;
                        loadMoreBtn.textContent = 'Daha Fazla Göster';

                        // Eğer event listener daha önce eklenmediyse
                        if (!loadMoreBtn.getAttribute('data-has-listener')) {
                            loadMoreBtn.addEventListener('click', () => {
                                this.loadMorePosts();
                            });
                            loadMoreBtn.setAttribute(
                                'data-has-listener',
                                'true'
                            );
                        }
                    }
                } else {
                    loadMoreContainer.style.display = 'none';
                }

                // Etkileşimleri ayarla
                this.setupPostInteractions();
            }
        } catch (error) {
            console.error('Gönderiler yüklenirken hata:', error);

            // Yükleme göstergesini güvenli bir şekilde gizle
            if (initialLoading && initialLoading.parentNode) {
                initialLoading.style.display = 'none';
            }

            // Hata mesajını göster
            if (postsContainer) {
                postsContainer.innerHTML = `
                    <div class="alert alert-error" style="text-align: center; margin-top: 20px;">
                        <p>Gönderiler yüklenirken bir hata oluştu.</p>
                        <button class="btn btn-primary btn-sm" style="margin-top: 10px;" 
                                onclick="window.HomePage.loadPosts(true)">Tekrar Dene</button>
                    </div>
                `;
            }
        } finally {
            this.isLoading = false;
        }
    }

    static loadMorePosts() {
        if (!this.isLoading && !this.allPostsLoaded) {
            this.loadPosts(false);
        }
    }

    static setupPostInteractions() {
        // Like butonları için event listener
        document.querySelectorAll('.like-button').forEach((button) => {
            button.addEventListener('click', async (e) => {
                try {
                    const postId = e.currentTarget.dataset.postId;
                    const isLiked = e.currentTarget.classList.contains('liked');

                    if (isLiked) {
                        // Beğeni kaldırma işlemi
                        console.log('Beğeni kaldırma işlemi henüz eklenmedi.');
                    } else {
                        // Beğeni işlemi
                        await PostService.likePost(postId);

                        // UI güncelle - null kontrolü ekle
                        if (e.currentTarget) {
                            e.currentTarget.classList.add('liked');

                            // İkon değişimi için null kontrolü
                            const icon = e.currentTarget.querySelector('i');
                            if (icon) {
                                icon.classList.remove('far');
                                icon.classList.add('fas');
                            }

                            // Beğeni sayısını artır - null kontrolü
                            const likesSpan =
                                e.currentTarget.querySelector('span');
                            if (likesSpan) {
                                const currentLikes = parseInt(
                                    likesSpan.textContent.trim() || '0'
                                );
                                likesSpan.textContent = (
                                    currentLikes + 1
                                ).toString();

                                // Beğeni sayısı yazısını da güncelle
                                const postCard =
                                    e.currentTarget.closest('.post-card');
                                if (postCard) {
                                    const likesText =
                                        postCard.querySelector(
                                            '.post-likes span'
                                        );
                                    if (likesText) {
                                        likesText.textContent = `${
                                            currentLikes + 1
                                        } beğenme`;
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Beğeni işlemi hatası:', error);
                    alert(
                        'Beğeni işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.'
                    );
                }
            });
        });

        // Yorum gönderme butonları için event listener
        document.querySelectorAll('.send-comment-btn').forEach((button) => {
            button.addEventListener('click', async (e) => {
                const postId = e.currentTarget.dataset.postId;
                const inputElement = document.getElementById(
                    `comment-input-${postId}`
                );
                const commentText = inputElement.value.trim();

                if (commentText) {
                    try {
                        await PostService.addComment(postId, commentText);
                        inputElement.value = '';
                        alert('Yorumunuz eklendi!');
                    } catch (error) {
                        console.error('Yorum gönderme hatası:', error);
                    }
                }
            });
        });

        // Yorum inputu değişimi takip etme
        document.querySelectorAll('.post-comment-input').forEach((input) => {
            input.addEventListener('input', (e) => {
                const submitButton = e.target.nextElementSibling;
                submitButton.disabled = e.target.value.trim() === '';
            });
        });

        // Gönderi paylaşma butonları için event listener
        document.querySelectorAll('.share-post-button').forEach((button) => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const postId = button.dataset.id;
                this.openSharePostModal(postId);
            });
        });
    }

    static renderPostComments(comments) {
        return comments
            .map(
                (comment) => `
            <div class="post-comment">
                <span class="post-comment-username">${comment.username}</span>
                <span class="post-comment-text">${comment.text}</span>
            </div>
        `
            )
            .join('');
    }

    // Yeni gönderi oluşturma modalını aç
    static async openPostCreationModal() {
        // Modal HTML'ini oluştur
        const modalHTML = `
            <div id="post-create-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            ">
                <div class="card" style="
                    width: 90%;
                    max-width: 500px;
                    padding: 0;
                    overflow: hidden;
                ">
                    <div class="card-header">
                        <h2 style="margin: 0; font-size: 20px;">Yeni Gönderi Oluştur</h2>
                        <button id="close-modal" class="btn btn-ghost btn-icon">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="upload-area" style="
                            border: 2px dashed var(--gray-300);
                            border-radius: var(--border-radius-lg);
                            padding: 40px 20px;
                            text-align: center;
                            margin-bottom: 20px;
                            cursor: pointer;
                            transition: all var(--transition-normal);
                        ">
                            <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: var(--primary-color); margin-bottom: 15px;"></i>
                            <p>Gönderi için fotoğraf yükle</p>
                            <input type="file" id="post-image-input" accept="image/*" style="display: none;">
                        </div>
                        
                        <img id="image-preview" style="width: 100%; max-height: 300px; object-fit: contain; display: none; margin-bottom: 20px; border-radius: var(--border-radius-lg);">
                        
                        <div class="form-group">
                            <label for="post-caption" style="display: block; margin-bottom: 8px; font-weight: 600;">Açıklama</label>
                            <textarea id="post-caption" class="input" rows="4" placeholder="Gönderiniz için açıklama yazın..."></textarea>
                        </div>
                        
                        <div id="post-error" class="alert alert-danger" style="margin-top: 15px; display: none;"></div>
                    </div>
                    <div class="card-footer">
                        <button id="share-post-btn" class="btn btn-primary" disabled>
                            <i class="fas fa-share-alt"></i> Paylaş
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Event listeners ekle
        const closeModalBtn = document.getElementById('close-modal');
        const uploadArea = document.getElementById('upload-area');
        const postImageInput = document.getElementById('post-image-input');
        const imagePreview = document.getElementById('image-preview');
        const sharePostBtn = document.getElementById('share-post-btn');
        const postCaption = document.getElementById('post-caption');
        const postError = document.getElementById('post-error');
        const modal = document.getElementById('post-create-modal');

        let selectedImage = null;

        closeModalBtn.addEventListener('click', () => {
            modal.remove();
        });

        uploadArea.addEventListener('click', () => {
            postImageInput.click();
        });

        postImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Görüntü dosyası kontrolü
                if (!file.type.startsWith('image/')) {
                    postError.textContent = 'Lütfen bir görüntü dosyası seçin';
                    postError.style.display = 'block';
                    return;
                }

                selectedImage = file;
                const reader = new FileReader();

                reader.onload = function (event) {
                    imagePreview.src = event.target.result;
                    imagePreview.style.display = 'block';
                    uploadArea.style.display = 'none';
                    sharePostBtn.disabled = false;
                };

                reader.readAsDataURL(file);
                postError.style.display = 'none';
            }
        });

        sharePostBtn.addEventListener('click', async () => {
            if (!selectedImage) {
                postError.textContent = 'Lütfen bir görüntü seçin';
                postError.style.display = 'block';
                return;
            }

            sharePostBtn.disabled = true;
            sharePostBtn.textContent = 'Paylaşılıyor...';

            try {
                // PostService'i kullanarak gönderiyi yükle
                await PostService.uploadPost(selectedImage, postCaption.value);

                // Başarıyla paylaşıldıysa modalı kapat
                modal.remove();

                // Sayfayı yenile ya da gönderiyi dinamik olarak ekleyebiliriz
                // Burada basitlik için sayfayı yeniliyoruz
                window.location.reload();
            } catch (error) {
                console.error('Gönderi paylaşma hatası:', error);
                postError.textContent = 'Gönderi paylaşılırken bir hata oluştu';
                postError.style.display = 'block';
                sharePostBtn.disabled = false;
                sharePostBtn.textContent = 'Paylaş';
            }
        });
    }

    static async openSharePostModal(postId) {
        try {
            // Gönderiyi paylaşma modalını oluştur
            const modalHTML = `
                <div id="share-post-modal" class="modal">
                    <div class="modal-content" style="max-width: 400px; padding: 20px;">
                        <h3>Gönderiyi Paylaş</h3>
                        <p style="margin: 15px 0;">Bu gönderiyi bir kullanıcıya mesaj olarak gönderin:</p>
                        
                        <input type="text" id="share-user-search" class="input" placeholder="Kullanıcı ara..." style="margin-bottom: 15px;">
                        
                        <div id="share-user-results" style="max-height: 250px; overflow-y: auto;">
                            <!-- Kullanıcılar burada listelenecek -->
                        </div>
                        
                        <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                            <button id="close-share-modal" class="btn btn-light">İptal</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Modal eventlerini ekle
            const modal = document.getElementById('share-post-modal');
            const closeBtn = document.getElementById('close-share-modal');
            const searchInput = document.getElementById('share-user-search');
            const resultsDiv = document.getElementById('share-user-results');

            closeBtn.addEventListener('click', () => {
                modal.remove();
            });

            // Kullanıcı arama fonksiyonu
            const debounce = (func, delay) => {
                let timeout;
                return function () {
                    const context = this;
                    const args = arguments;
                    clearTimeout(timeout);
                    timeout = setTimeout(
                        () => func.apply(context, args),
                        delay
                    );
                };
            };

            const searchUsers = async (query) => {
                if (!query || query.length < 2) {
                    resultsDiv.innerHTML =
                        '<p style="text-align: center; padding: 10px;">En az 2 karakter girin</p>';
                    return;
                }

                resultsDiv.innerHTML =
                    '<p style="text-align: center; padding: 10px;">Kullanıcılar aranıyor...</p>';

                try {
                    const { default: UserService } = await import(
                        '../services/user-service.js'
                    );
                    const users = await UserService.searchUsers(query);

                    if (!users || users.length === 0) {
                        resultsDiv.innerHTML =
                            '<p style="text-align: center; padding: 10px;">Kullanıcı bulunamadı</p>';
                        return;
                    }

                    resultsDiv.innerHTML = users
                        .map(
                            (user) => `
                        <div class="share-user-item" data-id="${
                            user.uid
                        }" data-username="${user.username}">
                            <img src="${
                                user.profileImage ||
                                user.profilePicture ||
                                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                            }" 
                                alt="${
                                    user.username
                                }" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
                            <div>
                                <div style="font-weight: bold;">${
                                    user.username || 'Kullanıcı'
                                }</div>
                                <div style="font-size: 12px; color: #8e8e8e;">${
                                    user.fullName || ''
                                }</div>
                            </div>
                        </div>
                    `
                        )
                        .join('');

                    // Kullanıcı seçimi için event listener'lar ekle
                    document
                        .querySelectorAll('.share-user-item')
                        .forEach((item) => {
                            item.addEventListener('click', async () => {
                                const userId = item.dataset.id;
                                const username = item.dataset.username;

                                try {
                                    item.innerHTML =
                                        '<div style="text-align: center; width: 100%;"><div class="spinner"></div>Paylaşılıyor...</div>';

                                    const { default: ShareService } =
                                        await import(
                                            '../services/share-service.js'
                                        );
                                    await ShareService.sharePostAsMessage(
                                        postId,
                                        userId
                                    );

                                    // Modal'ı kapat ve başarı mesajı göster
                                    modal.remove();
                                    alert(
                                        `Gönderi @${username} kullanıcısıyla başarıyla paylaşıldı.`
                                    );
                                } catch (error) {
                                    console.error(
                                        'Gönderi paylaşma hatası:',
                                        error
                                    );
                                    alert(
                                        `Gönderi paylaşılamadı: ${error.message}`
                                    );
                                }
                            });
                        });
                } catch (error) {
                    console.error('Kullanıcı arama hatası:', error);
                    resultsDiv.innerHTML =
                        '<p style="text-align: center; padding: 10px; color: red;">Arama sırasında bir hata oluştu</p>';
                }
            };

            const debouncedSearch = debounce(searchUsers, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });

            // Modal dışına tıklandığında kapatma
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        } catch (error) {
            console.error('Paylaşım modalı açılırken hata:', error);
            alert('Gönderi paylaşım modalı açılamadı.');
        }
    }

    static formatPostTime(timestamp) {
        if (!timestamp) return '';

        // Firestore timestamp'i Date objesine çevir
        const date = timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);

        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;

        return date.toLocaleDateString();
    }

    static async loadNotifications(
        notificationsList,
        notificationCount = null
    ) {
        try {
            console.log('Bildirimler yükleniyor...');
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || !notificationsList) return;

            // Bildirim servisini import et
            const NotificationService = await import(
                '../services/notification-service.js'
            ).then((module) => module.default || module.NotificationService);

            const notifications = await NotificationService.getNotifications(
                currentUser.uid
            );
            console.log('Bildirimler alındı:', notifications);

            // Okunmamış/bekleyen bildirimlerin sayısını hesapla
            const pendingCount = notifications.filter(
                (n) => n.status === 'pending' || !n.isRead
            ).length;

            // Bildirim sayacını güncelle
            if (notificationCount) {
                notificationCount.textContent = pendingCount;
                notificationCount.style.display =
                    pendingCount > 0 ? 'inline-block' : 'none';
            }

            // Bildirimleri listede göster
            if (notifications.length === 0) {
                notificationsList.innerHTML = `
                    <div class="notification-empty">
                        Yeni bildiriminiz yok
                    </div>
                `;
                return;
            }

            // Açılan bildirim panelindeki tüm bildirimleri okundu olarak işaretle
            if (pendingCount > 0) {
                await NotificationService.markAllAsRead(currentUser.uid);
            }

            notificationsList.innerHTML = notifications
                .map((notification) => {
                    if (
                        notification.type === 'follow_request' &&
                        notification.status === 'pending'
                    ) {
                        return `
                        <div class="notification-item" data-id="${
                            notification.id
                        }">
                            <div class="notification-content">
                                <strong>${
                                    notification.senderUsername ||
                                    'Bir kullanıcı'
                                }</strong> sizi takip etmek istiyor
                            </div>
                            <div class="notification-actions">
                                <button class="accept-btn" data-action="accept" data-id="${
                                    notification.id
                                }" data-sender="${
                            notification.senderUserId
                        }">Kabul Et</button>
                                <button class="reject-btn" data-action="reject" data-id="${
                                    notification.id
                                }" data-sender="${
                            notification.senderUserId
                        }">Reddet</button>
                            </div>
                            <div class="notification-time">${this.formatNotificationTime(
                                notification.createdAt
                            )}</div>
                        </div>
                    `;
                    }

                    if (notification.type === 'like') {
                        return `
                        <div class="notification-item" data-id="${
                            notification.id
                        }">
                            <div class="notification-content">
                                <strong>${
                                    notification.senderUsername ||
                                    'Bir kullanıcı'
                                }</strong> gönderinizi beğendi
                            </div>
                            <div class="notification-time">${this.formatNotificationTime(
                                notification.createdAt
                            )}</div>
                        </div>
                    `;
                    }

                    if (notification.type === 'comment') {
                        return `
                        <div class="notification-item" data-id="${
                            notification.id
                        }">
                            <div class="notification-content">
                                <strong>${
                                    notification.senderUsername ||
                                    'Bir kullanıcı'
                                }</strong> gönderinize yorum yaptı
                            </div>
                            <div class="notification-time">${this.formatNotificationTime(
                                notification.createdAt
                            )}</div>
                        </div>
                    `;
                    }

                    if (
                        notification.type === 'follow' &&
                        notification.status === 'completed'
                    ) {
                        return `
                        <div class="notification-item" data-id="${
                            notification.id
                        }">
                            <div class="notification-content">
                                <strong>${
                                    notification.senderUsername ||
                                    'Bir kullanıcı'
                                }</strong> sizi takip etmeye başladı
                            </div>
                            <div class="notification-time">${this.formatNotificationTime(
                                notification.createdAt
                            )}</div>
                        </div>
                    `;
                    }

                    return `
                    <div class="notification-item" data-id="${notification.id}">
                        <div class="notification-content">${
                            notification.content || 'Yeni bildirim'
                        }</div>
                        <div class="notification-time">${this.formatNotificationTime(
                            notification.createdAt
                        )}</div>
                    </div>
                `;
                })
                .join('');

            // Bildirim eylemleri için event listener'lar ekle
            notificationsList
                .querySelectorAll('.notification-actions button')
                .forEach((button) => {
                    button.addEventListener(
                        'click',
                        this.handleNotificationAction.bind(this)
                    );
                });
        } catch (error) {
            console.error('Bildirimler yüklenirken hata:', error);
            if (notificationsList) {
                notificationsList.innerHTML = `
                    <div class="notification-empty">
                        Bildirimler yüklenirken hata oluştu
                    </div>
                `;
            }
        }
    }

    static async handleNotificationAction(event) {
        const action = event.target.dataset.action;
        const notificationId = event.target.dataset.id;
        const senderId = event.target.dataset.sender;

        try {
            // Bildirim servisini import et
            const NotificationService = await import(
                '../services/notification-service.js'
            ).then((module) => module.default || module.NotificationService);

            const currentUser = AuthService.getCurrentUser();

            if (action === 'accept') {
                await NotificationService.handleFollowRequest(
                    notificationId,
                    true,
                    currentUser.uid,
                    senderId
                );

                // Takip isteği kabul edildiğinde bildirim sayısını güncelle
                const notificationCount =
                    document.getElementById('notification-count');
                const currentCount = parseInt(notificationCount.textContent);
                if (currentCount > 0) {
                    notificationCount.textContent = currentCount - 1;
                    if (currentCount - 1 <= 0) {
                        notificationCount.style.display = 'none';
                    }
                }

                event.target.parentElement.innerHTML =
                    '<span style="color: var(--success-color)">Kabul edildi</span>';
            } else if (action === 'reject') {
                await NotificationService.handleFollowRequest(
                    notificationId,
                    false,
                    currentUser.uid,
                    senderId
                );

                // Takip isteği reddedildiğinde bildirim sayısını güncelle
                const notificationCount =
                    document.getElementById('notification-count');
                const currentCount = parseInt(notificationCount.textContent);
                if (currentCount > 0) {
                    notificationCount.textContent = currentCount - 1;
                    if (currentCount - 1 <= 0) {
                        notificationCount.style.display = 'none';
                    }
                }

                event.target.parentElement.innerHTML =
                    '<span style="color: var(--text-secondary)">Reddedildi</span>';
            }
        } catch (error) {
            console.error('Bildirim eylemi işlenirken hata:', error);
            alert('İstek işlenirken bir hata oluştu');
        }
    }

    static formatNotificationTime(timestamp) {
        if (!timestamp) return '';

        // Firestore timestamp'i Date objesine çevir
        const date = timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);

        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;

        return date.toLocaleDateString();
    }

    static async checkUnreadMessages() {
        try {
            const { MessageService } = await import(
                '../services/message-service.js'
            );

            const unreadCount = await MessageService.getUnreadMessagesCount();
            const messagesBadge = document.getElementById('messages-badge');
            if (messagesBadge) {
                if (unreadCount > 0) {
                    messagesBadge.textContent =
                        unreadCount > 9 ? '9+' : unreadCount;
                    messagesBadge.style.display = 'flex';
                } else {
                    messagesBadge.style.display = 'none';
                }
            }

            // Her 1 dakikada bir kontrol et
            setTimeout(() => this.checkUnreadMessages(), 60000);
        } catch (error) {
            console.error('Okunmamış mesaj kontrolü hatası:', error);
        }
    }
}

export default HomePage;
