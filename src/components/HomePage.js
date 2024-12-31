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
                { username: 'user5', image: 'https://via.placeholder.com/150' }
            ];

            return stories.map(story => `
                <div class="story-item">
                    <img src="${story.image}" alt="${story.username}">
                    <span>${story.username}</span>
                </div>
            `).join('');
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
                    caption: 'Harika bir gün!'
                },
                { 
                    username: 'user2', 
                    userImage: 'https://via.placeholder.com/50', 
                    postImage: 'https://via.placeholder.com/600x400',
                    likes: 456,
                    caption: 'Keyifli bir an'
                }
            ];

            return posts.map(post => `
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
            `).join('');
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
                <div class="home-container">
                    <div class="home-navbar">
                        <div class="logo">Instagram</div>
                        <div class="nav-icons">
                            <i class="fas fa-home"></i>
                            <i class="fas fa-paper-plane"></i>
                            <i class="fas fa-plus-square"></i>
                            <i class="fas fa-compass"></i>
                            <i class="fas fa-heart"></i>
                            <i class="fas fa-user"></i>
                        </div>
                    </div>
                    
                    <div class="home-content">
                        <div class="user-info">
                            <h2>Hoş geldin, ${user?.profile?.username || user?.email || 'Kullanıcı'}</h2>
                        </div>
                        
                        <div class="stories-section">
                            <div class="stories-container">
                                ${this.renderStories()}
                            </div>
                        </div>
                        
                        <div class="posts-section">
                            ${this.renderPosts()}
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
            navIcons.forEach(icon => {
                icon.addEventListener('click', (e) => {
                    console.log('Nav ikonu tıklandı:', e.target.className);
                });
            });
        } catch (error) {
            console.error('Event listeners kurulumunda hata:', error);
        }
    }
}