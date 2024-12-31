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
                .logout-btn {
                    background: none;
                    border: 1px solid #dbdbdb;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .search-container {
                    position: relative;
                    margin-bottom: 20px;
                }
                .search-input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #dbdbdb;
                    border-radius: 8px;
                    font-size: 16px;
                }
                .search-results {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background-color: white;
                    border: 1px solid #dbdbdb;
                    border-radius: 0 0 8px 8px;
                    max-height: 300px;
                    overflow-y: auto;
                    z-index: 10;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .search-result-item {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .search-result-item:hover {
                    background-color: #f5f5f5;
                }
                .search-result-item img {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 10px;
                    object-fit: cover;
                }
                .search-result-item .user-info {
                    display: flex;
                    flex-direction: column;
                }
                .search-result-item .username {
                    font-weight: bold;
                }
                .search-result-item .full-name {
                    color: #8e8e8e;
                    font-size: 14px;
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

            feedContainer.innerHTML = posts.map(post => `
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
            `).join('');

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
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Çıkış butonuna tıklandı');
                try {
                    await AuthService.logout();
                } catch (error) {
                    console.error('Çıkış hatası:', error);
                    alert('Çıkış yapılırken bir hata oluştu');
                }
            });
        } else {
            console.error('Logout butonu bulunamadı');
        }

        // Arama input event listener'ı
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');

        if (searchInput && searchResults) {
            let searchTimeout;
            
            searchInput.addEventListener('input', async (e) => {
                clearTimeout(searchTimeout);
                
                const searchTerm = e.target.value.trim();
                
                console.log('Arama terimi:', searchTerm);

                if (searchTerm === '' || searchTerm.length < 2) {
                    searchResults.innerHTML = '';
                    searchResults.style.display = 'none';
                    return;
                }

                searchTimeout = setTimeout(async () => {
                    try {
                        const results = await SearchService.searchUsers(searchTerm);
                        console.log('Arama sonuçları:', results);
                        
                        this.displaySearchResults(results);
                    } catch (error) {
                        console.error('Arama hatası:', error);
                    }
                }, 300);
            });

            // Dış tıklamalarda arama sonuçlarını gizleme
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    searchResults.innerHTML = '';
                    searchResults.style.display = 'none';
                }
            });
        } else {
            console.error('Arama inputu veya sonuç alanı bulunamadı');
        }
    }

    static setupPostEventListeners() {
        const likeBtns = document.querySelectorAll('.like-btn');
        const commentBtns = document.querySelectorAll('.comment-btn');
        const postCards = document.querySelectorAll('.post-card');

        likeBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = e.target.dataset.postId;
                try {
                    const newLikeCount = await PostService.likePost(postId);
                    btn.innerHTML = `❤️ ${newLikeCount}`;
                } catch (error) {
                    console.error('Beğeni hatası:', error);
                }
            });
        });

        commentBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = e.target.dataset.postId;
                const commentText = prompt('Yorumunuzu yazın:');
                
                if (commentText) {
                    try {
                        await PostService.addComment(postId, commentText);
                        alert('Yorum başarıyla eklendi');
                    } catch (error) {
                        console.error('Yorum ekleme hatası:', error);
                    }
                }
            });
        });

        postCards.forEach(card => {
            card.addEventListener('click', async (e) => {
                if (!e.target.closest('.like-btn, .comment-btn')) {
                    const postId = card.dataset.postId;
                    try {
                        await this.openPostModal(postId);
                    } catch (error) {
                        console.error('Gönderi detayı açılırken hata:', error);
                    }
                }
            });
        });
    }

    static async openPostModal(postId) {
        try {
            const post = await PostService.getPostById(postId);
            const comments = await PostService.getPostComments(postId);

            const modalHtml = `
                <div class="post-modal">
                    <div class="post-modal-content">
                        <div class="post-modal-image">
                            <img src="${post.imageUrl}" alt="Gönderi">
                        </div>
                        <div class="post-modal-details">
                            <div class="post-modal-header">
                                <img 
                                    src="${post.profileImage || '/default-avatar.png'}" 
                                    alt="Profil" 
                                    class="post-user-avatar"
                                >
                                <span class="post-username">${post.username}</span>
                            </div>
                            <div class="post-modal-caption">
                                ${post.caption || ''}
                            </div>
                            <div class="post-modal-comments">
                                ${comments.map(comment => `
                                    <div class="comment">
                                        <strong>${comment.username}</strong> 
                                        ${comment.text}
                                    </div>
                                `).join('')}
                            </div>
                            <div class="post-modal-actions">
                                <button class="like-btn" data-post-id="${postId}">
                                    ❤️ ${post.likes || 0}
                                </button>
                                <div class="comment-input-container">
                                    <input 
                                        type="text" 
                                        id="comment-input" 
                                        placeholder="Yorum yap..."
                                    >
                                    <button id="send-comment-btn" data-post-id="${postId}">
                                        Gönder
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button class="close-modal-btn">&times;</button>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            const modal = document.querySelector('.post-modal');
            const closeBtn = modal.querySelector('.close-modal-btn');
            const likeBtn = modal.querySelector('.like-btn');
            const sendCommentBtn = modal.querySelector('#send-comment-btn');
            const commentInput = modal.querySelector('#comment-input');

            closeBtn.addEventListener('click', () => {
                modal.remove();
            });

            likeBtn.addEventListener('click', async () => {
                try {
                    const newLikeCount = await PostService.likePost(postId);
                    likeBtn.innerHTML = `❤️ ${newLikeCount}`;
                } catch (error) {
                    console.error('Beğeni hatası:', error);
                }
            });

            sendCommentBtn.addEventListener('click', async () => {
                const commentText = commentInput.value.trim();
                if (commentText) {
                    try {
                        const newComment = await PostService.addComment(postId, commentText);
                        
                        const commentsContainer = modal.querySelector('.post-modal-comments');
                        const commentElement = document.createElement('div');
                        commentElement.classList.add('comment');
                        commentElement.innerHTML = `
                            <strong>${newComment.username}</strong> 
                            ${newComment.text}
                        `;
                        commentsContainer.appendChild(commentElement);

                        commentInput.value = '';
                    } catch (error) {
                        console.error('Yorum gönderme hatası:', error);
                    }
                }
            });

        } catch (error) {
            console.error('Post detayları alınırken hata:', error);
        }
    }

    static displaySearchResults(results) {
        const searchResults = document.getElementById('search-results');
        
        if (!searchResults) {
            console.error('Arama sonuç alanı bulunamadı');
            return;
        }

        searchResults.innerHTML = '';

        if (results.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        results.forEach(user => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('search-result-item');
            resultItem.innerHTML = `
                <img src="${user.profileImage}" alt="${user.username}">
                <div class="user-info">
                    <span class="username">@${user.username}</span>
                    <span class="full-name">${user.fullName || ''}</span>
                </div>
            `;

            resultItem.addEventListener('click', () => {
                window.location.href = `/profile/${user.username}`;
            });

            searchResults.appendChild(resultItem);
        });

        searchResults.style.display = 'block';
    }
}

export default HomePage;