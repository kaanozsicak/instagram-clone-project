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

            // Sayfayı oluştur
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
                    
                    .home-page {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        background-color: var(--bg-color);
                        min-height: 100vh;
                    }
                    
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 30px;
                        padding: 15px 20px;
                        background-color: var(--card-color);
                        border-radius: 16px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        position: relative;
                    }
                    
                    .header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 6px;
                        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                        border-top-left-radius: 16px;
                        border-top-right-radius: 16px;
                    }
                    
                    .app-logo {
                        font-size: 24px;
                        font-weight: 700;
                        color: var(--primary-color);
                    }
                    
                    nav {
                        display: flex;
                        gap: 15px;
                        align-items: center;
                    }
                    
                    #profile-link {
                        color: var(--primary-color);
                        text-decoration: none;
                        font-weight: 600;
                        transition: all 0.2s ease;
                    }
                    
                    #profile-link:hover {
                        background-color: rgba(85, 99, 222, 0.1);
                        padding: 8px 12px;
                        border-radius: 8px;
                    }
                    
                    #logout-button {
                        background-color: var(--error-color);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background-color 0.2s ease, transform 0.1s ease;
                    }
                    
                    #logout-button:hover {
                        background-color: #c0392b;
                        transform: translateY(-1px);
                    }
                    
                    .home-content {
                        display: grid;
                        grid-template-columns: 2fr 1fr;
                        gap: 30px;
                    }
                    
                    @media (max-width: 992px) {
                        .home-content {
                            grid-template-columns: 1fr;
                        }
                    }
                    
                    .search-box {
                        position: relative;
                        margin-bottom: 30px;
                    }
                    
                    #search-input {
                        width: 100%;
                        padding: 12px 16px;
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        font-size: 15px;
                        background-color: #f9fafc;
                        color: var(--text-primary);
                        transition: all 0.2s ease;
                    }
                    
                    #search-input:focus {
                        outline: none;
                        border-color: var(--primary-color);
                        box-shadow: 0 0 0 3px rgba(85, 99, 222, 0.2);
                    }
                    
                    #search-results {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        width: 100%;
                        background: var(--card-color);
                        border: 1px solid var(--border-color);
                        border-top: none;
                        border-radius: 0 0 8px 8px;
                        z-index: 10;
                        max-height: 300px;
                        overflow-y: auto;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    }
                    
                    .search-result-item {
                        padding: 12px 16px;
                        border-bottom: 1px solid var(--border-color);
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                    }
                    
                    .search-result-item:last-child {
                        border-bottom: none;
                    }
                    
                    .search-result-item:hover {
                        background-color: rgba(85, 99, 222, 0.05);
                    }
                    
                    .posts-container {
                        display: flex;
                        flex-direction: column;
                        gap: 30px;
                    }
                    
                    .post-card {
                        background-color: var(--card-color);
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    }
                    
                    .post-header {
                        padding: 15px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .user-avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        object-fit: cover;
                        border: 2px solid var(--primary-light);
                    }
                    
                    .username {
                        font-weight: 600;
                        color: var(--text-primary);
                    }
                    
                    .post-image {
                        width: 100%;
                        max-height: 600px;
                        object-fit: cover;
                    }
                    
                    .post-image img {
                        width: 100%;
                        display: block;
                    }
                    
                    .post-actions {
                        padding: 15px;
                    }
                    
                    .action-icons {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 15px;
                    }
                    
                    .action-icons i {
                        color: var(--text-primary);
                        font-size: 24px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    
                    .action-icons i:hover {
                        color: var(--primary-color);
                        transform: scale(1.1);
                    }
                    
                    .post-likes {
                        font-weight: 600;
                        margin-bottom: 8px;
                        color: var(--text-primary);
                    }
                    
                    .post-caption {
                        margin-bottom: 12px;
                        color: var(--text-primary);
                    }
                    
                    .post-caption .username {
                        font-weight: 600;
                    }
                    
                    .post-comments-link {
                        color: var(--text-secondary);
                        font-size: 14px;
                        cursor: pointer;
                        display: block;
                        margin-bottom: 10px;
                    }
                    
                    .post-add-comment {
                        display: flex;
                        border-top: 1px solid var(--border-color);
                        padding-top: 15px;
                    }
                    
                    .post-add-comment input {
                        flex: 1;
                        border: none;
                        outline: none;
                        padding: 10px 0;
                        font-size: 14px;
                        color: var(--text-primary);
                    }
                    
                    .post-add-comment button {
                        background: none;
                        border: none;
                        color: var(--primary-color);
                        font-weight: 600;
                        cursor: pointer;
                        padding: 0 10px;
                    }
                    
                    .post-add-comment button:disabled {
                        color: var(--text-secondary);
                        cursor: default;
                        opacity: 0.7;
                    }
                    
                    .notification-container {
                        position: relative;
                        margin-right: 15px;
                    }
                    
                    #notification-btn {
                        background: none;
                        border: none;
                        font-size: 20px;
                        cursor: pointer;
                        position: relative;
                        color: var(--text-secondary);
                        transition: color 0.2s ease;
                        padding: 5px;
                    }
                    
                    #notification-btn:hover {
                        color: var(--primary-color);
                        background-color: rgba(85, 99, 222, 0.1);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    #notification-count {
                        position: absolute;
                        top: -5px;
                        right: -5px;
                        background-color: var(--secondary-color);
                        color: white;
                        border-radius: 50%;
                        padding: 0 6px;
                        font-size: 12px;
                        min-width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .notification-panel {
                        position: absolute;
                        top: 100%;
                        right: 0;
                        width: 320px;
                        background-color: var(--card-color);
                        border-radius: 12px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        z-index: 100;
                        overflow: hidden;
                        display: none;
                    }
                    
                    .notification-header {
                        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                        color: white;
                        padding: 12px 15px;
                        text-align: center;
                        font-weight: 600;
                    }
                    
                    .notifications-list {
                        max-height: 400px;
                        overflow-y: auto;
                    }
                    
                    .notification-item {
                        padding: 12px 15px;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .notification-item:last-child {
                        border-bottom: none;
                    }
                    
                    .notification-content {
                        margin-bottom: 8px;
                        color: var(--text-primary);
                    }
                    
                    .notification-actions {
                        display: flex;
                        gap: 10px;
                    }
                    
                    .notification-actions button {
                        padding: 6px 12px;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.2s ease;
                    }
                    
                    .accept-btn {
                        background-color: var(--primary-color);
                        color: white;
                    }
                    
                    .accept-btn:hover {
                        background-color: var(--primary-dark);
                    }
                    
                    .reject-btn {
                        background-color: var(--error-color);
                        color: white;
                    }
                    
                    .reject-btn:hover {
                        background-color: #c0392b;
                    }
                    
                    .notification-empty {
                        padding: 20px;
                        text-align: center;
                        color: var(--text-secondary);
                        font-style: italic;
                    }
                    
                    .notification-time {
                        font-size: 12px;
                        color: var(--text-secondary);
                    }
                    
                    .empty-state {
                        text-align: center;
                        padding: 40px 20px;
                        background-color: var(--card-color);
                        border-radius: 16px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    }
                    
                    .empty-state h3 {
                        color: var(--text-primary);
                        margin-bottom: 10px;
                    }
                    
                    .empty-state p {
                        color: var(--text-secondary);
                    }

                    .loading-spinner {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 20px;
                        color: var(--text-secondary);
                    }
                    
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid rgba(0, 0, 0, 0.1);
                        border-left-color: var(--primary-color);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    
                    #load-more-container {
                        text-align: center;
                        padding: 20px;
                        display: none;
                    }
                </style>
                
                <div class="home-page">
                    <header class="header">
                        <h1 class="app-logo">Photogram</h1>
                        <nav>
                            <div class="notification-container">
                                <button id="notification-btn">
                                    <i class="fas fa-bell"></i>
                                    <span id="notification-count">0</span>
                                </button>
                                <div id="notification-panel" class="notification-panel">
                                    <div class="notification-header">Bildirimler</div>
                                    <div id="notifications-list" class="notifications-list">
                                        <div class="notification-empty">Yükleniyor...</div>
                                    </div>
                                </div>
                            </div>
                            <a href="#" id="profile-link">Profilim</a>
                            <button id="logout-button">Çıkış Yap</button>
                        </nav>
                    </header>
                    
                    <main class="home-content">
                        <div>
                            <div class="search-box">
                                <input type="text" id="search-input" placeholder="Kullanıcı ara...">
                                <div id="search-results" style="display: none;"></div>
                            </div>
                            
                            <div class="posts-container" id="posts-container">
                                <div class="loading-spinner" id="initial-loading">
                                    <div class="spinner"></div>
                                </div>
                            </div>
                            
                            <div id="load-more-container">
                                <div class="loading-spinner">
                                    <div class="spinner"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="sidebar">
                            <div class="profile-card post-card">
                                <div class="post-header">
                                    <img 
                                        src="${
                                            userProfile.profilePicture ||
                                            userProfile.profileImage ||
                                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                                        }" 
                                        alt="${
                                            userProfile.username || 'Kullanıcı'
                                        }"
                                        class="user-avatar"
                                    >
                                    <div>
                                        <div class="username">@${
                                            userProfile.username || 'kullanici'
                                        }</div>
                                        <div style="color: var(--text-secondary); font-size: 14px;">
                                            ${userProfile.fullName || ''}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="padding: 15px;">
                                    <button class="new-post-btn" style="
                                        background-color: var(--primary-color);
                                        color: white;
                                        border: none;
                                        border-radius: 8px;
                                        padding: 10px 16px;
                                        font-weight: 600;
                                        cursor: pointer;
                                        width: 100%;
                                        transition: background-color 0.2s ease;
                                    ">
                                        Yeni Gönderi Oluştur
                                    </button>
                                </div>
                            </div>
                            
                            <div class="suggested-users post-card" style="margin-top: 30px;">
                                <div style="padding: 15px; border-bottom: 1px solid var(--border-color);">
                                    <h3 style="margin: 0; color: var(--text-primary);">Senin İçin Öneriler</h3>
                                </div>
                                
                                <div style="padding: 15px;" id="suggested-users-container">
                                    ${
                                        suggestedUsers.length > 0
                                            ? suggestedUsers
                                                  .map(
                                                      (user) => `
                                                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                                    <img src="${
                                                        user.profilePicture ||
                                                        user.profileImage ||
                                                        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                                                    }" 
                                                         alt="${
                                                             user.username ||
                                                             'Kullanıcı'
                                                         }" 
                                                         class="user-avatar" 
                                                         style="width: 32px; height: 32px; margin-right: 10px;">
                                                    <div style="flex: 1;">
                                                        <div class="username">@${
                                                            user.username
                                                        }</div>
                                                        <div style="color: var(--text-secondary); font-size: 12px;">${
                                                            user.fullName || ''
                                                        }</div>
                                                    </div>
                                                    <button 
                                                        class="follow-suggestion-btn" 
                                                        data-user-id="${
                                                            user.uid
                                                        }" 
                                                        data-username="${
                                                            user.username
                                                        }"
                                                        style="
                                                            background: none; 
                                                            border: none; 
                                                            color: var(--primary-color);
                                                            font-weight: 600;
                                                            cursor: pointer;
                                                        "
                                                    >
                                                        Takip Et
                                                    </button>
                                                </div>
                                            `
                                                  )
                                                  .join('')
                                            : `
                                                <div style="text-align: center; padding: 10px; color: var(--text-secondary);">
                                                    Öneri bulunmuyor
                                                </div>
                                            `
                                    }
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
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
                button.addEventListener('click', async (e) => {
                    const username = e.target.dataset.username;
                    const userId = e.target.dataset.userId;

                    try {
                        const result = await this.followUser(username);

                        if (result === 'pending') {
                            e.target.textContent = 'İstek Gönderildi';
                            e.target.disabled = true;
                            e.target.style.color = 'var(--text-secondary)';
                        } else if (result === true) {
                            e.target.textContent = 'Takip Ediliyor';
                            e.target.disabled = true;
                            e.target.style.color = 'var(--success-color)';
                        }
                    } catch (error) {
                        console.error('Takip etme hatası:', error);
                        alert('Takip etme işlemi sırasında bir hata oluştu');
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

        try {
            this.isLoading = true;

            if (!isInitialLoad) {
                loadMoreContainer.style.display = 'block';
            }

            const posts = await PostService.getFollowedUsersPosts(
                this.postsPerPage,
                this.lastVisiblePost
            );

            // İlk yüklemede yükleniyor göstergesini kaldır
            if (isInitialLoad && initialLoading) {
                postsContainer.removeChild(initialLoading);
            }

            if (posts.length === 0) {
                if (isInitialLoad) {
                    postsContainer.innerHTML = `
                        <div class="empty-state">
                            <h3>Henüz gönderi yok</h3>
                            <p>Takip ettiğiniz kişilerin gönderileri burada görünecek</p>
                        </div>
                    `;
                }

                this.allPostsLoaded = true;
                loadMoreContainer.innerHTML = `
                    <p style="color: var(--text-secondary);">Tüm gönderiler yüklendi</p>
                `;
                return;
            }

            // Son yüklenen gönderiyi kaydet (sonraki yükleme için)
            this.lastVisiblePost = posts[posts.length - 1].id;

            const postsHTML = posts
                .map(
                    (post) => `
                <div class="post-card" data-post-id="${post.id}">
                    <div class="post-header">
                        <img src="${
                            post.profileImage ||
                            post.profilePicture ||
                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                        }" 
                             alt="${post.username}" 
                             class="user-avatar"
                             style="cursor: pointer"
                             onclick="window.location.href='/profile/${
                                 post.username
                             }'">
                        <strong class="username" style="cursor: pointer" 
                             onclick="window.location.href='/profile/${
                                 post.username
                             }'">${post.username}</strong>
                        <span style="margin-left: auto; font-size: 12px; color: var(--text-secondary);">
                            ${this.formatPostTime(post.createdAt)}
                        </span>
                    </div>
                    <img class="post-image" src="${
                        post.imageUrl
                    }" alt="Post image">
                    <div class="post-actions">
                        <div class="action-icons">
                            <button class="like-button" data-post-id="${
                                post.id
                            }" style="background:none; border:none; cursor:pointer; display:flex; align-items:center; padding:0;">
                                <i class="fas fa-heart" style="font-size: 18px;"></i> <span style="margin-left:5px;">${
                                    post.likes || 0
                                }</span>
                            </button>
                            <button class="comment-button" data-post-id="${
                                post.id
                            }" style="background:none; border:none; cursor:pointer; display:flex; align-items:center; padding:0; margin-left:15px;">
                                <i class="fas fa-comment" style="font-size: 18px;"></i> <span style="margin-left:5px;">Yorum</span>
                            </button>
                        </div>
                        <div class="post-caption">
                            <strong>${post.username}</strong> ${
                        post.caption || ''
                    }
                        </div>
                    </div>
                    <div class="post-add-comment">
                        <input type="text" placeholder="Yorum ekle..." id="comment-input-${
                            post.id
                        }">
                        <button class="send-comment-btn" data-post-id="${
                            post.id
                        }">Gönder</button>
                    </div>
                </div>
            `
                )
                .join('');

            if (isInitialLoad) {
                postsContainer.innerHTML = postsHTML;
            } else {
                postsContainer.insertAdjacentHTML('beforeend', postsHTML);
            }

            // Post etkileşim butonlarına event listener ekle
            this.setupPostInteractions();

            // Yükleme tamamlandı
            this.isLoading = false;
            loadMoreContainer.style.display = 'none';
        } catch (error) {
            console.error('Gönderiler yüklenirken hata:', error);

            if (isInitialLoad) {
                postsContainer.innerHTML = `
                    <div class="error-state">
                        <h3>Gönderiler yüklenemedi</h3>
                        <p>Lütfen daha sonra tekrar deneyin</p>
                        <button onclick="HomePage.loadPosts()" class="btn btn-primary" style="margin-top: 15px;">Tekrar Dene</button>
                    </div>
                `;
            } else {
                loadMoreContainer.innerHTML = `
                    <button onclick="HomePage.loadMorePosts()" class="btn btn-primary">Tekrar Dene</button>
                `;
            }

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
                const postId = e.currentTarget.dataset.postId;
                try {
                    await PostService.likePost(postId);
                    const currentLikes = parseInt(
                        e.currentTarget.textContent.trim().split(' ')[1] || 0
                    );
                    e.currentTarget.innerHTML = `<i class="fas fa-heart" style="color: var (--secondary-color);"></i> ${
                        currentLikes + 1
                    }`;
                } catch (error) {
                    console.error('Beğenme hatası:', error);
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
                <div style="
                    background-color: white;
                    border-radius: 10px;
                    padding: 20px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; font-size: 20px;">Yeni Gönderi Oluştur</h2>
                        <button id="close-modal" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                    </div>
                    
                    <div id="upload-area" style="
                        border: 2px dashed #ccc;
                        padding: 40px 20px;
                        text-align: center;
                        margin-bottom: 20px;
                        cursor: pointer;
                    ">
                        <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #5563de; margin-bottom: 15px;"></i>
                        <p>Gönderi için fotoğraf yükle</p>
                        <input type="file" id="post-image-input" accept="image/*" style="display: none;">
                    </div>
                    
                    <img id="image-preview" style="width: 100%; max-height: 300px; object-fit: contain; display: none; margin-bottom: 20px;">
                    
                    <div>
                        <label for="post-caption" style="display: block; margin-bottom: 8px; font-weight: 600;">Açıklama</label>
                        <textarea id="post-caption" style="
                            width: 100%;
                            padding: 10px;
                            border: 1px solid #ccc;
                            border-radius: 5px;
                            height: 100px;
                            resize: vertical;
                        " placeholder="Gönderiniz için açıklama yazın..."></textarea>
                    </div>
                    
                    <div id="post-error" style="color: red; margin-top: 10px; display: none;"></div>
                    
                    <button id="share-post-btn" style="
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        margin-top: 20px;
                        cursor: pointer;
                        font-weight: 600;
                        width: 100%;
                    " disabled>Paylaş</button>
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

            try {
                sharePostBtn.disabled = true;
                sharePostBtn.textContent = 'Paylaşılıyor...';

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
}

export default HomePage;
