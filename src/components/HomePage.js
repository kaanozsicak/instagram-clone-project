export class HomePage {
    // Static metodları sınıf içinde tanımlayın
    static renderStories() {
        try {
            // Mock story verisi
            const stories = [
                { username: 'user1', image: 'https://via.placeholder.com/150' },
                { username: 'user2', image: 'https://via.placeholder.com/150' },
                { username: 'user3', image: 'https://via.placeholder.com/150' },
                { username: 'user4', image: 'https://via.placeholder.com/150' },
                { username: 'user5', image: 'https://via.placeholder.com/150' },
            ];

            return stories
                .map(
                    (story) => `
                <div class="story-item">
                    <img src="${story.image}" alt="${story.username}">
                    <span>${story.username}</span>
                </div>
            `
                )
                .join('');
        } catch (error) {
            console.error('Stories render hatası:', error);
            return '';
        }
    }

    static renderPosts() {
        try {
            // Mock post verisi
            const posts = [
                {
                    username: 'user1',
                    userImage: 'https://via.placeholder.com/50',
                    postImage: 'https://via.placeholder.com/600x400',
                    likes: 123,
                    caption: 'Harika bir gün!',
                },
                {
                    username: 'user2',
                    userImage: 'https://via.placeholder.com/50',
                    postImage: 'https://via.placeholder.com/600x400',
                    likes: 456,
                    caption: 'Keyifli bir an',
                },
            ];

            return posts
                .map(
                    (post) => `
                <div class="post-item">
                    <div class="post-header">
                        <img src="${post.userImage}" alt="${post.username}" class="user-avatar">
                        <span class="username">${post.username}</span>
                    </div>
                    <div class="post-image">
                        <img src="${post.postImage}" alt="${post.username} post">
                    </div>
                    <div class="post-actions">
                        <div class="action-icons">
                            <i class="fas fa-heart"></i>
                            <i class="fas fa-comment"></i>
                            <i class="fas fa-paper-plane"></i>
                        </div>
                        <div class="post-likes">${post.likes} beğenme</div>
                        <div class="post-caption">
                            <span class="username">${post.username}</span> 
                            ${post.caption}
                        </div>
                    </div>
                </div>
            `
                )
                .join('');
        } catch (error) {
            console.error('Posts render hatası:', error);
            return '';
        }
    }

    static render(user) {
        console.log('HomePage render metodu çağrıldı', user);

        const appContainer = document.getElementById('app');
        if (!appContainer) {
            console.error('App konteyneri bulunamadı');
            return;
        }

        try {
            appContainer.innerHTML = `
                <link rel="stylesheet" href="/styles/theme.css">
                <style>
                    .home-container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        background-color: var(--bg-color);
                    }
                    
                    .home-navbar {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 15px 20px;
                        background-color: var(--card-color);
                        border-radius: 12px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                        margin-bottom: 30px;
                    }
                    
                    .logo {
                        font-size: 24px;
                        font-weight: 700;
                        color: var(--primary-color);
                    }
                    
                    .nav-icons {
                        display: flex;
                        gap: 20px;
                        align-items: center;
                    }
                    
                    .nav-icon {
                        font-size: 22px;
                        color: var(--text-secondary);
                        cursor: pointer;
                        transition: all 0.2s ease;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                    }
                    
                    .nav-icon:hover {
                        color: var(--primary-color);
                        background-color: rgba(85, 99, 222, 0.1);
                    }
                    
                    .home-layout {
                        display: grid;
                        grid-template-columns: 7fr 3fr;
                        gap: 30px;
                    }
                    
                    .content-area {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                    }
                    
                    .sidebar {
                        position: sticky;
                        top: 20px;
                        height: fit-content;
                    }
                    
                    .user-profile-card {
                        background-color: var(--card-color);
                        border-radius: 16px;
                        padding: 20px;
                        margin-bottom: 20px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                        display: flex;
                        align-items: center;
                    }
                    
                    .profile-avatar {
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        object-fit: cover;
                        margin-right: 15px;
                        border: 3px solid var(--primary-light);
                    }
                    
                    .profile-info h3 {
                        margin: 0 0 5px 0;
                        color: var(--text-primary);
                    }
                    
                    .profile-info p {
                        margin: 0;
                        color: var(--text-secondary);
                        font-size: 14px;
                    }
                    
                    .stories-card {
                        background-color: var(--card-color);
                        border-radius: 16px;
                        padding: 20px;
                        margin-bottom: 20px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    }
                    
                    .stories-title {
                        margin-top: 0;
                        margin-bottom: 15px;
                        color: var(--text-primary);
                        font-size: 18px;
                    }
                    
                    .stories-container {
                        display: flex;
                        gap: 15px;
                        overflow-x: auto;
                        padding: 5px 0;
                        scrollbar-width: thin;
                        scrollbar-color: var(--primary-light) transparent;
                    }
                    
                    .stories-container::-webkit-scrollbar {
                        height: 6px;
                    }
                    
                    .stories-container::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    
                    .stories-container::-webkit-scrollbar-thumb {
                        background-color: var(--primary-light);
                        border-radius: 3px;
                    }
                    
                    .story-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        flex: 0 0 auto;
                    }
                    
                    .story-item img {
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        object-fit: cover;
                        border: 3px solid var(--primary-color);
                        padding: 2px;
                        cursor: pointer;
                        transition: transform 0.2s;
                    }
                    
                    .story-item img:hover {
                        transform: scale(1.05);
                    }
                    
                    .story-item span {
                        margin-top: 5px;
                        font-size: 12px;
                        color: var(--text-secondary);
                        max-width: 70px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        text-align: center;
                    }
                    
                    .post-card {
                        background-color: var(--card-color);
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                        margin-bottom: 20px;
                    }
                    
                    .post-header {
                        display: flex;
                        align-items: center;
                        padding: 15px;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .user-avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        margin-right: 10px;
                        object-fit: cover;
                    }
                    
                    .username {
                        font-weight: 600;
                        color: var(--text-primary);
                    }
                    
                    .post-time {
                        margin-left: auto;
                        color: var(--text-secondary);
                        font-size: 12px;
                    }
                    
                    .post-image {
                        width: 100%;
                        max-height: 600px;
                        object-fit: cover;
                    }
                    
                    .post-actions {
                        padding: 15px;
                    }
                    
                    .action-icons {
                        display: flex;
                        gap: 15px;
                        margin-bottom: 10px;
                    }
                    
                    .action-btn {
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: var(--text-primary);
                        font-size: 22px;
                        padding: 5px;
                        border-radius: 5px;
                        transition: all 0.2s;
                    }
                    
                    .action-btn:hover {
                        color: var(--primary-color);
                        background-color: rgba(85, 99, 222, 0.1);
                    }
                    
                    .like-btn.active {
                        color: var(--secondary-color);
                    }
                    
                    .post-likes {
                        font-weight: 600;
                        margin-bottom: 5px;
                        color: var(--text-primary);
                    }
                    
                    .post-caption {
                        margin-bottom: 10px;
                        color: var(--text-primary);
                    }
                    
                    .post-comments-link {
                        color: var(--text-secondary);
                        font-size: 14px;
                        cursor: pointer;
                    }
                    
                    .post-add-comment {
                        display: flex;
                        border-top: 1px solid var(--border-color);
                        padding-top: 15px;
                        margin-top: 10px;
                    }
                    
                    .post-add-comment input {
                        flex: 1;
                        border: none;
                        outline: none;
                        padding: 10px 0;
                        font-size: 14px;
                        background: transparent;
                        color: var(--text-primary);
                    }
                    
                    .post-add-comment button {
                        background: none;
                        border: none;
                        color: var(--primary-color);
                        font-weight: 600;
                        cursor: pointer;
                        padding: 10px;
                    }
                    
                    .post-add-comment button:disabled {
                        opacity: 0.5;
                        cursor: default;
                    }
                    
                    .suggestions-card {
                        background-color: var(--card-color);
                        border-radius: 16px;
                        padding: 20px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    }
                    
                    .suggestions-title {
                        margin-top: 0;
                        margin-bottom: 15px;
                        font-size: 18px;
                        color: var(--text-primary);
                    }
                    
                    .suggestion-item {
                        display: flex;
                        align-items: center;
                        margin-bottom: 15px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .suggestion-item:last-child {
                        margin-bottom: 0;
                        padding-bottom: 0;
                        border-bottom: none;
                    }
                    
                    .suggestion-avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        margin-right: 10px;
                        object-fit: cover;
                    }
                    
                    .suggestion-info {
                        flex: 1;
                    }
                    
                    .suggestion-username {
                        font-weight: 600;
                        color: var(--text-primary);
                        display: block;
                        margin-bottom: 2px;
                    }
                    
                    .suggestion-text {
                        font-size: 12px;
                        color: var(--text-secondary);
                    }
                    
                    .follow-btn {
                        background: none;
                        border: none;
                        color: var(--primary-color);
                        font-weight: 600;
                        cursor: pointer;
                    }
                    
                    @media (max-width: 992px) {
                        .home-layout {
                            grid-template-columns: 1fr;
                        }
                        
                        .sidebar {
                            display: none;
                        }
                    }
                    
                    @media (max-width: 576px) {
                        .home-navbar {
                            padding: 10px;
                        }
                        
                        .logo {
                            font-size: 20px;
                        }
                        
                        .nav-icons {
                            gap: 15px;
                        }
                        
                        .nav-icon {
                            font-size: 18px;
                        }
                    }
                </style>
                
                <div class="home-container">
                    <div class="home-navbar">
                        <div class="logo">Photogram</div>
                        <div class="nav-icons">
                            <div class="nav-icon">
                                <i class="fas fa-home"></i>
                            </div>
                            <div class="nav-icon">
                                <i class="fas fa-search"></i>
                            </div>
                            <div class="nav-icon">
                                <i class="fas fa-plus-square"></i>
                            </div>
                            <div class="nav-icon">
                                <i class="fas fa-heart"></i>
                            </div>
                            <div class="nav-icon" title="Profil">
                                <i class="fas fa-user"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="home-layout">
                        <div class="content-area">
                            <div class="stories-card">
                                <h3 class="stories-title">Hikayeler</h3>
                                <div class="stories-container">
                                    ${this.renderStories()}
                                </div>
                            </div>
                            
                            <div class="posts-container">
                                ${this.renderPosts()}
                            </div>
                        </div>
                        
                        <div class="sidebar">
                            <div class="user-profile-card">
                                <img 
                                    src="${
                                        user?.profile?.profilePicture ||
                                        'https://via.placeholder.com/150'
                                    }" 
                                    alt="${
                                        user?.profile?.username || 'Kullanıcı'
                                    }"
                                    class="profile-avatar"
                                >
                                <div class="profile-info">
                                    <h3>${
                                        user?.profile?.username || 'Kullanıcı'
                                    }</h3>
                                    <p>${user?.profile?.fullName || ''}</p>
                                </div>
                            </div>
                            
                            <div class="suggestions-card">
                                <h3 class="suggestions-title">Senin İçin Öneriler</h3>
                                <div class="suggestions-list">
                                    <div class="suggestion-item">
                                        <img src="https://via.placeholder.com/150" alt="user1" class="suggestion-avatar">
                                        <div class="suggestion-info">
                                            <span class="suggestion-username">user1</span>
                                            <span class="suggestion-text">Senin için öneriliyor</span>
                                        </div>
                                        <button class="follow-btn">Takip Et</button>
                                    </div>
                                    
                                    <div class="suggestion-item">
                                        <img src="https://via.placeholder.com/150" alt="user2" class="suggestion-avatar">
                                        <div class="suggestion-info">
                                            <span class="suggestion-username">user2</span>
                                            <span class="suggestion-text">Senin için öneriliyor</span>
                                        </div>
                                        <button class="follow-btn">Takip Et</button>
                                    </div>
                                    
                                    <div class="suggestion-item">
                                        <img src="https://via.placeholder.com/150" alt="user3" class="suggestion-avatar">
                                        <div class="suggestion-info">
                                            <span class="suggestion-username">user3</span>
                                            <span class="suggestion-text">Senin için öneriliyor</span>
                                        </div>
                                        <button class="follow-btn">Takip Et</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            console.log('HomePage içeriği başarıyla render edildi');
            this.setupEventListeners();
        } catch (error) {
            console.error('HomePage render sırasında hata:', error);
        }
    }

    static setupEventListeners() {
        try {
            // Navbar ikonları için event listener
            const navIcons = document.querySelectorAll('.nav-icons i');
            navIcons.forEach((icon) => {
                icon.addEventListener('click', (e) => {
                    console.log('Nav ikonu tıklandı:', e.target.className);
                });
            });
        } catch (error) {
            console.error('Event listeners kurulumunda hata:', error);
        }
    }
}
