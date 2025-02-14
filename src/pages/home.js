import { AuthService } from '../services/auth-service.js';
import { SearchService } from '../services/search-service.js';
import { PostService } from '../services/post-service.js';

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
            </style>
            <div class="home-container">
                <div class="header">
                    <div class="logo">Instagram Clone</div>
                    <div class="nav-links">
                        <a href="/profile" class="nav-link">Profilim</a>
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
            const posts = await PostService.getFollowedUsersPosts();

            const feedContainer = document.getElementById('feed-container');

            if (posts.length === 0) {
                feedContainer.innerHTML = `
                    <p class="no-posts">
                        Henüz hiç gönderi yok. 
                        Kullanıcıları takip etmeye başlayın!
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
                        <span class="post-username">${post.username}</span>
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

            this.setupPostEventListeners();
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

    static setupEventListeners() {
        console.log('Event listeners kuruluyor...');

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
