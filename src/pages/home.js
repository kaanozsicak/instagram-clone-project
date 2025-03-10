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
                <div class="home-page">
                    <header class="header">
                        <h1>Instagram Clone</h1>
                        <nav>
                            <div class="notification-container">
                                <button id="notification-btn">🔔 <span id="notification-count">0</span></button>
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
                    
                    <main>
                        <div class="search-box">
                            <input type="text" id="search-input" placeholder="Kullanıcı ara...">
                            <div id="search-results"></div>
                        </div>
                        
                        <div class="posts-container" id="posts-container">
                            <p>Gönderiler yükleniyor...</p>
                        </div>
                    </main>
                </div>
                
                <style>
                    .home-page {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #ddd;
                    }
                    
                    nav {
                        display: flex;
                        gap: 15px;
                        align-items: center;
                    }
                    
                    #profile-link {
                        color: #0095f6;
                        text-decoration: none;
                        font-weight: bold;
                    }
                    
                    #logout-button {
                        background: #ff3b30;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    
                    .search-box {
                        margin-bottom: 20px;
                        position: relative;
                    }
                    
                    #search-input {
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    
                    #search-results {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        width: 100%;
                        background: white;
                        border: 1px solid #ddd;
                        border-top: none;
                        display: none;
                        z-index: 10;
                    }
                    
                    .search-result-item {
                        padding: 10px;
                        border-bottom: 1px solid #eee;
                        cursor: pointer;
                    }
                    
                    .search-result-item:hover {
                        background: #f9f9f9;
                    }
                    
                    .posts-container {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                    }
                    
                    .post-card {
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    
                    .post-header {
                        padding: 10px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .post-image {
                        width: 100%;
                        max-height: 500px;
                        object-fit: cover;
                    }
                    
                    .post-actions {
                        padding: 10px;
                        display: flex;
                        gap: 15px;
                    }
                    
                    .post-caption {
                        padding: 0 10px 10px;
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
                    }
                    
                    #notification-count {
                        position: absolute;
                        top: -5px;
                        right: -8px;
                        background-color: #ff3b30;
                        color: white;
                        border-radius: 50%;
                        padding: 0 6px;
                        font-size: 12px;
                        min-width: 18px;
                        text-align: center;
                        display: inline-block;
                    }
                    
                    .notification-panel {
                        position: absolute;
                        top: 100%;
                        right: 0;
                        width: 300px;
                        background-color: white;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        z-index: 1000;
                        display: none;
                    }
                    
                    .notification-header {
                        padding: 10px;
                        border-bottom: 1px solid #ddd;
                        font-weight: bold;
                        text-align: center;
                    }
                    
                    .notifications-list {
                        max-height: 400px;
                        overflow-y: auto;
                    }
                    
                    .notification-item {
                        padding: 12px;
                        border-bottom: 1px solid #f1f1f1;
                    }
                    
                    .notification-item:last-child {
                        border-bottom: none;
                    }
                    
                    .notification-content {
                        margin-bottom: 10px;
                    }
                    
                    .notification-actions {
                        display: flex;
                        gap: 8px;
                    }
                    
                    .notification-actions button {
                        padding: 6px 10px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    
                    .accept-btn {
                        background-color: #0095f6;
                        color: white;
                    }
                    
                    .reject-btn {
                        background-color: #ff3b30;
                        color: white;
                    }
                    
                    .notification-empty {
                        padding: 15px;
                        text-align: center;
                        color: #8e8e8e;
                    }
                    
                    .notification-time {
                        font-size: 12px;
                        color: #8e8e8e;
                        margin-top: 5px;
                    }
                </style>
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
