import { AuthService } from '../services/auth-service.js';
import { SearchService } from '../services/search-service.js';
import { PostService } from '../services/post-service.js';
import { NotificationService } from '../services/notification-service.js'; // Yeni import
import NotificationMenu from '../components/notification-menu.js'; // Yeni import

class HomePage {
    static async render() {
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
                .home-container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Arial', sans-serif;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #262626;
                }
                .nav-links {
                    display: flex;
                    gap: 15px;
                }
                .nav-link {
                    text-decoration: none;
                    color: #0095f6;
                    cursor: pointer;
                }
                .search-container {
                    position: relative;
                    margin-bottom: 20px;
                    width: 100%;
                    max-width: 400px;
                }
                .search-input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #dbdbdb;
                    border-radius: 8px;
                    font-size: 14px;
                    background-color: #fafafa;
                }
                .search-results {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background-color: white;
                    border: 1px solid #dbdbdb;
                    border-radius: 0 0 8px 8px;
                    max-height: 400px;
                    overflow-y: auto;
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    margin-top: 4px;
                }
                .search-result-item {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .search-result-item:hover {
                    background-color: #fafafa;
                }
                .search-result-item img {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    margin-right: 12px;
                    object-fit: cover;
                }
                .search-result-item .user-info {
                    display: flex;
                    flex-direction: column;
                }
                .search-result-item .username {
                    font-weight: 600;
                    color: #262626;
                    font-size: 14px;
                }
                .search-result-item .full-name {
                    color: #8e8e8e;
                    font-size: 14px;
                    margin-top: 2px;
                }
                .logout-btn {
                    padding: 8px 16px;
                    background-color: #0095f6;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background-color 0.2s;
                }
                .logout-btn:hover {
                    background-color: #0081d6;
                }
                .feed-container {
                    margin-top: 20px;
                }
                .no-posts {
                    text-align: center;
                    color: #8e8e8e;
                }
                .post-card {
                    border: 1px solid #dbdbdb;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    overflow: hidden;
                }
                .post-header {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    border-bottom: 1px solid #dbdbdb;
                }
                .post-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 10px;
                    object-fit: cover;
                }
                .post-image {
                    width: 100%;
                    max-height: 600px;
                    object-fit: cover;
                }
                .post-actions {
                    display: flex;
                    padding: 10px;
                    border-top: 1px solid #dbdbdb;
                    border-bottom: 1px solid #dbdbdb;
                }
                .like-btn, .comment-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    margin-right: 15px;
                    display: flex;
                    align-items: center;
                }
                .like-btn i, .comment-btn i {
                    margin-right: 5px;
                }
                .post-caption {
                    padding: 10px;
                }
                .post-date {
                    font-size: 12px;
                    color: #8e8e8e;
                    margin-left: 10px;
                }
            </style>
            <div class="home-container">
                <div class="header">
                    <div class="logo">Instagram Clone</div>
                    <div class="nav-links">
                        <div class="notifications-dropdown">
                            <button id="notifications-btn" class="notifications-btn">
                                🔔 <span id="notification-count"></span>
                            </button>
                            <div id="notifications-menu" class="notifications-menu" style="display: none;">
                                <div id="notifications-list"></div>
                            </div>
                        </div>
                        <a href="#" id="profile-link" class="nav-link">Profilim</a>
                        <button id="logout-btn" class="logout-btn">Çıkış Yap</button>
                    </div>
                </div>
                <div class="search-container">
                    <input 
                        type="text" 
                        id="search-input" 
                        class="search-input" 
                        placeholder="Kullanıcı ara"
                    >
                    <div id="search-results" class="search-results"></div>
                </div>
                <div id="feed-container" class="feed-container">
                    <p class="no-posts">Henüz hiç gönderi yok</p>
                </div>
            </div>
        `;

        try {
            console.log('Gönderiler yükleniyor...');
            const posts = await PostService.getFollowedUsersPosts();
            console.log('Yüklenen gönderi sayısı:', posts.length);

            const feedContainer = document.getElementById('feed-container');

            if (!posts || posts.length === 0) {
                feedContainer.innerHTML = `
                    <p class="no-posts">
                        Henüz hiç gönderi yok veya hiç kimseyi takip etmiyorsunuz. 
                        <br>
                        Kullanıcıları takip etmeye başlayın veya kendi gönderilerinizi paylaşın!
                    </p>
                `;
                return;
            }

            feedContainer.innerHTML = posts
                .map(
                    (post) => `
                <div class="post-card" data-post-id="${post.id}">
                    <div class="post-header">
                        <img 
                            src="${post.profileImage || '/default-avatar.png'}" 
                            alt="Profil" 
                            class="post-avatar"
                        >
                        <div>
                            <span class="post-username">${post.username}</span>
                            <span class="post-date">${post.formattedDate}</span>
                        </div>
                    </div>
                    <img 
                        src="${post.imageUrl}" 
                        alt="Gönderi" 
                        class="post-image"
                    >
                    <div class="post-actions">
                        <button class="like-btn" data-post-id="${post.id}">
                            ❤️ ${post.likes || 0}
                        </button>
                        <button class="comment-btn" data-post-id="${post.id}">
                            💬 Yorum Yap
                        </button>
                    </div>
                    <div class="post-caption">
                        <strong>${post.username}</strong> ${post.caption || ''}
                    </div>
                </div>
            `
                )
                .join('');

            const postCards = document.querySelectorAll('.post-card');
            postCards.forEach((postCard) => {
                const postId = postCard.dataset.postId;

                // Beğeni butonu event listener'ı
                const likeBtn = postCard.querySelector('.like-btn');
                if (likeBtn) {
                    likeBtn.addEventListener('click', async () => {
                        try {
                            const updatedLikes = await PostService.likePost(
                                postId
                            );
                            likeBtn.innerHTML = `❤️ ${updatedLikes}`;
                        } catch (error) {
                            console.error('Beğeni hatası:', error);
                        }
                    });
                }

                // Yorum butonu event listener'ı
                const commentBtn = postCard.querySelector('.comment-btn');
                if (commentBtn) {
                    commentBtn.addEventListener('click', async () => {
                        // Post modalını açabilirsiniz veya yorum yapma alanını gösterebilirsiniz
                        const comment = prompt('Yorumunuzu yazın:');
                        if (comment) {
                            try {
                                await PostService.addComment(postId, comment);
                                alert('Yorumunuz eklendi!');
                            } catch (error) {
                                console.error('Yorum ekleme hatası:', error);
                                alert('Yorum eklenirken bir hata oluştu');
                            }
                        }
                    });
                }

                // Post'a tıklama event listener'ı
                postCard.addEventListener('click', (e) => {
                    // Beğeni ve yorum butonlarına tıklandığında modal açılmasın
                    if (
                        !e.target.closest('.like-btn') &&
                        !e.target.closest('.comment-btn')
                    ) {
                        this.openPostModal(postId);
                    }
                });
            });
        } catch (error) {
            console.error('Gönderiler yüklenirken hata:', error);
            const feedContainer = document.getElementById('feed-container');
            feedContainer.innerHTML = `
                <p class="no-posts">
                    Gönderiler yüklenirken bir hata oluştu. 
                    Lütfen daha sonra tekrar deneyin.
                </p>
            `;
        }

        this.setupEventListeners();
    }

    static async openPostModal(postId) {
        try {
            const post = await PostService.getPostById(postId);
            const comments = await PostService.getPostComments(postId);

            // Modal HTML'ini oluştur ve göster
            // ... (ProfilePage'deki openPostModal metodunu buraya kopyalayabilirsiniz)
        } catch (error) {
            console.error('Post detayları alınırken hata:', error);
        }
    }

    static async setupEventListeners() {
        console.log('Event listeners kuruluyor...');

        // Bildirim sistemi elementleri
        const notificationsBtn = document.getElementById('notifications-btn');
        const notificationsMenu = document.getElementById('notifications-menu');
        const notificationsList = document.getElementById('notifications-list');
        const notificationsContainer = document.querySelector(
            '.notifications-dropdown'
        );
        const currentUser = AuthService.getCurrentUser();

        // Bildirim sistemi
        if (
            notificationsBtn &&
            notificationsMenu &&
            notificationsList &&
            currentUser
        ) {
            const loadNotifications = async () => {
                try {
                    const notifications =
                        await NotificationService.getNotifications(
                            currentUser.uid
                        );
                    console.log('Gelen bildirimler:', notifications);

                    const pendingRequests = notifications.filter(
                        (n) =>
                            n.type === 'follow_request' &&
                            n.status === 'pending'
                    );

                    // Bildirim sayacını güncelle
                    notificationsBtn.innerHTML =
                        pendingRequests.length > 0
                            ? `🔔 <span class="notification-count">${pendingRequests.length}</span>`
                            : '🔔';

                    // Bildirim listesini güncelle
                    notificationsList.innerHTML = notifications
                        .map((notification) => {
                            if (
                                notification.type === 'follow_request' &&
                                notification.status === 'pending'
                            ) {
                                return `
                                    <div class="notification-item">
                                        <p><strong>${notification.senderUsername}</strong> sizi takip etmek istiyor</p>
                                        <div class="notification-actions">
                                            <button onclick="acceptFollowRequest('${notification.id}', '${notification.senderUserId}')">
                                                Kabul Et
                                            </button>
                                            <button onclick="rejectFollowRequest('${notification.id}', '${notification.senderUserId}')">
                                                Reddet
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }
                            return '';
                        })
                        .join('');
                } catch (error) {
                    console.error('Bildirimler yüklenirken hata:', error);
                }
            };

            // İlk yükleme ve periyodik kontrol
            await loadNotifications();
            setInterval(loadNotifications, 30000);

            // Bildirim menüsü olayları
            notificationsBtn.addEventListener('click', () => {
                notificationsMenu.style.display =
                    notificationsMenu.style.display === 'none'
                        ? 'block'
                        : 'none';
            });

            // Dışarı tıklandığında menüyü kapat
            document.addEventListener('click', (e) => {
                if (
                    !notificationsBtn.contains(e.target) &&
                    !notificationsMenu.contains(e.target)
                ) {
                    notificationsMenu.style.display = 'none';
                }
            });

            // Global bildirim işleme fonksiyonları
            window.acceptFollowRequest = async (notificationId, senderId) => {
                try {
                    await NotificationService.handleFollowRequest(
                        notificationId,
                        true,
                        currentUser.uid,
                        senderId
                    );
                    await loadNotifications();
                    location.reload();
                } catch (error) {
                    console.error('Takip isteği kabul hatası:', error);
                    alert('İstek kabul edilirken bir hata oluştu');
                }
            };

            window.rejectFollowRequest = async (notificationId, senderId) => {
                try {
                    await NotificationService.handleFollowRequest(
                        notificationId,
                        false,
                        currentUser.uid,
                        senderId
                    );
                    await loadNotifications();
                } catch (error) {
                    console.error('Takip isteği red hatası:', error);
                    alert('İstek reddedilirken bir hata oluştu');
                }
            };
        }

        // Çıkış butonu event listener'ı
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    const confirmed = window.confirm(
                        'Çıkış yapmak istediğinizden emin misiniz?'
                    );
                    if (confirmed) {
                        await AuthService.logout();
                    }
                } catch (error) {
                    console.error('Çıkış hatası:', error);
                    alert('Çıkış yapılırken bir hata oluştu');
                }
            });
        }

        // Profilim linki için event listener ekle
        const profileLink = document.getElementById('profile-link');
        if (profileLink) {
            profileLink.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const currentUser = await AuthService.getUserProfile(
                        AuthService.getCurrentUser().uid
                    );
                    if (currentUser && currentUser.username) {
                        window.location.href = `/profile/${currentUser.username}`;
                    } else {
                        console.error('Kullanıcı bilgileri alınamadı');
                        alert('Profil bilgilerinize erişilemiyor');
                    }
                } catch (error) {
                    console.error('Profil yönlendirme hatası:', error);
                }
            });
        }

        // Arama input event listener'ı
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');

        if (searchInput && searchResults) {
            let searchTimeout;

            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);

                const searchTerm = e.target.value.trim();
                console.log('Arama terimi:', searchTerm);

                if (searchTerm === '') {
                    searchResults.style.display = 'none';
                    return;
                }

                searchTimeout = setTimeout(async () => {
                    try {
                        const results = await SearchService.searchUsers(
                            searchTerm
                        );
                        console.log('Arama sonuçları:', results);

                        if (results.length === 0) {
                            searchResults.innerHTML =
                                '<div class="search-result-item">Kullanıcı bulunamadı</div>';
                        } else {
                            searchResults.innerHTML = results
                                .map(
                                    (user) => `
                                <div class="search-result-item" data-username="${user.username}">
                                    <img src="${user.profileImage}" alt="${user.username}">
                                    <div class="user-info">
                                        <span class="username">@${user.username}</span>
                                        <span class="full-name">${user.fullName}</span>
                                    </div>
                                </div>
                            `
                                )
                                .join('');
                        }

                        searchResults.style.display = 'block';

                        // Arama sonuçlarına tıklama olaylarını ekle
                        const resultItems = searchResults.querySelectorAll(
                            '.search-result-item'
                        );
                        resultItems.forEach((item) => {
                            item.addEventListener('click', () => {
                                const username = item.dataset.username;
                                window.location.href = `/profile/${username}`;
                            });
                        });
                    } catch (error) {
                        console.error('Arama hatası:', error);
                        searchResults.innerHTML =
                            '<div class="search-result-item">Arama sırasında bir hata oluştu</div>';
                    }
                }, 300);
            });

            // Sayfa dışına tıklandığında arama sonuçlarını gizle
            document.addEventListener('click', (e) => {
                if (
                    !searchInput.contains(e.target) &&
                    !searchResults.contains(e.target)
                ) {
                    searchResults.style.display = 'none';
                }
            });
        }
    }
}

export default HomePage;
