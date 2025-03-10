import { AuthService } from '../services/auth-service.js';
import { SearchService } from '../services/search-service.js';
import { PostService } from '../services/post-service.js';

class HomePage {
    static async render() {
        console.log('HomePage render başladı');
        try {
            const currentUser = await AuthService.ensureCurrentUser();
            console.log('Current user:', currentUser);

            if (!currentUser) {
                console.log(
                    'Kullanıcı oturumu yok, login sayfasına yönlendiriliyor'
                );
                window.location.href = '/login';
                return;
            }

            const appContainer = document.getElementById('app');
            if (!appContainer) {
                console.error('App container bulunamadı');
                return;
            }

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
                        padding: 8px 12px;
                        border-radius: 8px;
                    }
                    
                    #profile-link:hover {
                        background-color: rgba(85, 99, 222, 0.1);
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
                    
                    .search-result-item:hover {
                        background-color: rgba(85, 99, 222, 0.05);
                    }
                    
                    .search-result-item:last-child {
                        border-bottom: none;
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
                        font-size: 24px;
                    }
                    
                    .action-icons i {
                        color: var(--text-primary);
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
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    #notification-btn:hover {
                        color: var(--primary-color);
                        background-color: rgba(85, 99, 222, 0.1);
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
                                <div class="empty-state">
                                    <h3>Gönderiler yükleniyor...</h3>
                                    <p>Lütfen bekleyiniz</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="sidebar">
                            <div class="profile-card post-card">
                                <div class="post-header">
                                    <img 
                                        src="${
                                            currentUser?.profile
                                                ?.profilePicture ||
                                            'https://via.placeholder.com/150'
                                        }" 
                                        alt="${
                                            currentUser?.profile?.username ||
                                            'Kullanıcı'
                                        }"
                                        class="user-avatar"
                                    >
                                    <div>
                                        <div class="username">@${
                                            currentUser?.profile?.username ||
                                            'kullanici'
                                        }</div>
                                        <div style="color: var(--text-secondary); font-size: 14px;">
                                            ${
                                                currentUser?.profile
                                                    ?.fullName || ''
                                            }
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
                                
                                <div style="padding: 15px;">
                                    <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                        <img src="https://via.placeholder.com/150" alt="Kullanıcı" class="user-avatar" style="width: 32px; height: 32px; margin-right: 10px;">
                                        <div style="flex: 1;">
                                            <div class="username">@kullanici1</div>
                                        </div>
                                        <button style="
                                            background: none; 
                                            border: none; 
                                            color: var(--primary-color);
                                            font-weight: 600;
                                            cursor: pointer;
                                        ">
                                            Takip Et
                                        </button>
                                    </div>
                                    
                                    <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                        <img src="https://via.placeholder.com/150" alt="Kullanıcı" class="user-avatar" style="width: 32px; height: 32px; margin-right: 10px;">
                                        <div style="flex: 1;">
                                            <div class="username">@kullanici2</div>
                                        </div>
                                        <button style="
                                            background: none; 
                                            border: none; 
                                            color: var(--primary-color);
                                            font-weight: 600;
                                            cursor: pointer;
                                        ">
                                            Takip Et
                                        </button>
                                    </div>
                                    
                                    <div style="display: flex; align-items: center;">
                                        <img src="https://via.placeholder.com/150" alt="Kullanıcı" class="user-avatar" style="width: 32px; height: 32px; margin-right: 10px;">
                                        <div style="flex: 1;">
                                            <div class="username">@kullanici3</div>
                                        </div>
                                        <button style="
                                            background: none; 
                                            border: none; 
                                            color: var(--primary-color);
                                            font-weight: 600;
                                            cursor: pointer;
                                        ">
                                            Takip Et
                                        </button>
                                    </div>
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
        }
    }

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
                            <strong>@${user.username}</strong>
                            <div>${user.fullName || ''}</div>
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
    }

    static async loadPosts() {
        console.log('Gönderiler yükleniyor');
        const postsContainer = document.getElementById('posts-container');

        try {
            const posts = await PostService.getFollowedUsersPosts();

            if (posts.length === 0) {
                postsContainer.innerHTML = `
                    <div class="empty-state">
                        <h3>Henüz gönderi yok</h3>
                        <p>Takip ettiğiniz kişilerin gönderileri burada görünecek</p>
                    </div>
                `;
                return;
            }

            postsContainer.innerHTML = posts
                .map(
                    (post) => `
                <div class="post-card" data-post-id="${post.id}">
                    <div class="post-header">
                        <img src="${
                            post.profileImage || '/default-avatar.png'
                        }" alt="${
                        post.username
                    }" width="40" height="40" style="border-radius: 50%;">
                        <strong>${post.username}</strong>
                    </div>
                    <img class="post-image" src="${
                        post.imageUrl
                    }" alt="Post image">
                    <div class="post-actions">
                        <button class="like-btn">❤️ ${post.likes || 0}</button>
                        <button class="comment-btn">💬 Yorum</button>
                    </div>
                    <div class="post-caption">
                        <strong>${post.username}</strong> ${post.caption || ''}
                    </div>
                </div>
            `
                )
                .join('');
        } catch (error) {
            console.error('Gönderiler yüklenirken hata:', error);
            postsContainer.innerHTML = `
                <div class="error-state">
                    <h3>Gönderiler yüklenemedi</h3>
                    <p>Lütfen daha sonra tekrar deneyin</p>
                </div>
            `;
        }
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
                alert('Takip isteği kabul edildi');
            } else if (action === 'reject') {
                await NotificationService.handleFollowRequest(
                    notificationId,
                    false,
                    currentUser.uid,
                    senderId
                );
                alert('Takip isteği reddedildi');
            }

            // Bildirimleri yenile
            const notificationsList =
                document.getElementById('notifications-list');
            const notificationCount =
                document.getElementById('notification-count');
            await this.loadNotifications(notificationsList, notificationCount);
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
