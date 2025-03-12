import { AuthService } from '../services/auth-service.js';
import { PostService } from '../services/post-service.js';
import { ProfileService } from '../services/profile-service.js';
import { FollowService } from '../services/follow-service.js'; // Add the missing import

class PostDetailPage {
    static async render(postId) {
        const appContainer = document.getElementById('app');

        try {
            // Oturum kontrolü yap
            const currentUser = await AuthService.ensureCurrentUser();
            if (!currentUser) {
                window.location.href = '/login';
                return;
            }

            // Yükleniyor göster
            appContainer.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
                    <div class="spinner spinner-lg"></div>
                </div>
            `;

            // Gönderiyi yükle
            const post = await PostService.getPostById(postId);
            if (!post) {
                appContainer.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h2>Gönderi Bulunamadı</h2>
                        <p>İstediğiniz gönderi silinmiş veya erişim izniniz yok olabilir.</p>
                        <button class="btn btn-primary" onclick="window.location.href='/home'">Ana Sayfaya Dön</button>
                    </div>
                `;
                return;
            }

            // Gizlilik kontrolü
            const isPrivate = await ProfileService.getPrivacySettings(
                post.userId
            );
            const canViewPost = await this.canViewPost(
                currentUser.uid,
                post.userId,
                isPrivate
            );

            if (!canViewPost) {
                appContainer.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h2>Gizli Gönderi</h2>
                        <p>Bu gönderiyi görüntüleyebilmek için kullanıcıyı takip etmelisiniz.</p>
                        <button class="btn btn-primary" onclick="window.location.href='/profile/${post.username}'">Profili Görüntüle</button>
                    </div>
                `;
                return;
            }

            // Gönderi yorumlarını al
            const comments = await PostService.getPostComments(postId);

            // Sayfayı render et
            appContainer.innerHTML = `
                <link rel="stylesheet" href="/src/styles/ui-components.css">
                <style>
                    .post-detail-page {
                        max-width: 935px;
                        margin: 20px auto;
                        background-color: white;
                        border-radius: 8px;
                        box-shadow: var(--shadow-md);
                        overflow: hidden;
                    }
                    
                    .post-detail-header {
                        display: flex;
                        align-items: center;
                        padding: 15px;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .post-detail-header img {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        margin-right: 10px;
                        object-fit: cover;
                    }
                    
                    .post-detail-header .username {
                        font-weight: 600;
                        color: var(--text-primary);
                    }
                    
                    .post-detail-content {
                        display: flex;
                        flex-direction: column;
                        min-height: 60vh;
                    }
                    
                    .post-detail-image {
                        flex: 0 0 65%;
                        background-color: black;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .post-detail-image img {
                        max-width: 100%;
                        max-height: 80vh;
                        object-fit: contain;
                    }
                    
                    .post-detail-info {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        padding: 15px;
                        border-top: 1px solid var(--border-color);
                    }
                    
                    .post-detail-caption {
                        margin-bottom: 15px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .post-detail-caption .username {
                        font-weight: 600;
                        margin-right: 5px;
                    }
                    
                    .post-detail-comments {
                        flex: 1;
                        overflow-y: auto;
                        max-height: 300px;
                        margin-bottom: 15px;
                    }
                    
                    .post-comment {
                        margin-bottom: 10px;
                    }
                    
                    .post-comment .username {
                        font-weight: 600;
                        margin-right: 5px;
                    }
                    
                    .post-detail-actions {
                        padding-top: 15px;
                        display: flex;
                        align-items: center;
                        border-top: 1px solid var(--border-color);
                        margin-top: auto; /* Push to bottom */
                    }
                    
                    .post-detail-actions button {
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        margin-right: 15px;
                        color: var(--text-secondary);
                    }
                    
                    .comment-input-container {
                        display: flex;
                        padding: 15px;
                        border-top: 1px solid var(--border-color);
                    }
                    
                    .comment-input {
                        flex: 1;
                        border: none;
                        outline: none;
                        padding: 8px 0;
                    }
                    
                    .post-time {
                        font-size: 12px;
                        color: var(--gray-500);
                        margin-top: 10px;
                    }
                    
                    @media (min-width: 768px) {
                        .post-detail-content {
                            flex-direction: row;
                            height: 80vh;
                        }
                        
                        .post-detail-image {
                            flex: 0 0 65%;
                        }
                        
                        .post-detail-info {
                            flex: 0 0 35%;
                            border-top: none;
                            border-left: 1px solid var(--border-color);
                        }
                    }
                    
                    .back-header {
                        padding: 15px;
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        align-items: center;
                    }
                </style>
                
                <div class="back-header">
                    <button class="btn btn-ghost btn-sm" id="back-btn">
                        <i class="fas fa-arrow-left"></i> Geri
                    </button>
                </div>
                
                <div class="post-detail-page">
                    <div class="post-detail-header">
                        <img src="${
                            post.profileImage ||
                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                        }" alt="${post.username}">
                        <span class="username">${post.username}</span>
                    </div>
                    
                    <div class="post-detail-content">
                        <div class="post-detail-image">
                            <img src="${post.imageUrl}" alt="Gönderi">
                        </div>
                        
                        <div class="post-detail-info">
                            <div class="post-detail-caption">
                                <span class="username">${post.username}</span>
                                <span>${post.caption || ''}</span>
                                <div class="post-time">${this.formatPostTime(
                                    post.createdAt
                                )}</div>
                            </div>
                            
                            <div class="post-detail-comments">
                                ${this.renderPostComments(comments)}
                            </div>
                            
                            <div class="post-detail-actions">
                                <button class="like-button" data-id="${
                                    post.id
                                }">
                                    <i class="far fa-heart"></i>
                                </button>
                                <button class="comment-button" data-id="${
                                    post.id
                                }">
                                    <i class="far fa-comment"></i>
                                </button>
                                <button class="share-post-button" data-id="${
                                    post.id
                                }">
                                    <i class="far fa-paper-plane"></i>
                                </button>
                            </div>
                            
                            <div class="comment-input-container">
                                <input class="comment-input" placeholder="Yorum ekle..." id="comment-input">
                                <button class="btn btn-primary btn-sm send-comment-btn" data-id="${
                                    post.id
                                }">Gönder</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupEventListeners(post);
        } catch (error) {
            console.error('Gönderi detay sayfası render hatası:', error);
            appContainer.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2>Bir Hata Oluştu</h2>
                    <p>${
                        error.message || 'Gönderi yüklenirken bir sorun oluştu.'
                    }</p>
                    <button class="btn btn-primary" onclick="window.location.href='/home'">Ana Sayfaya Dön</button>
                </div>
            `;
        }
    }

    static async canViewPost(currentUserId, postOwnerId, isPrivate) {
        if (!isPrivate) return true; // Gizli değilse herkes görebilir
        if (currentUserId === postOwnerId) return true; // Kendi gönderisi ise görebilir

        // Takip edip etmediğini kontrol et
        const following = await FollowService.getFollowing(currentUserId);
        return following.includes(postOwnerId);
    }

    static renderPostComments(comments) {
        if (!comments || comments.length === 0) {
            return '<p style="text-align: center; color: var(--text-secondary); padding: 20px 0;">Henüz yorum yok</p>';
        }

        return comments
            .map(
                (comment) => `
            <div class="post-comment">
                <span class="username">${comment.username}</span>
                <span>${comment.text}</span>
            </div>
        `
            )
            .join('');
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

        if (diffSecs < 60) return 'az önce';
        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;

        return date.toLocaleDateString();
    }

    static setupEventListeners(post) {
        // Geri butonu
        document.getElementById('back-btn').addEventListener('click', () => {
            history.back();
        });

        // Yorum ekleme
        const commentInput = document.getElementById('comment-input');
        const sendCommentBtn = document.querySelector('.send-comment-btn');

        sendCommentBtn.addEventListener('click', async () => {
            const comment = commentInput.value.trim();
            if (!comment) return;

            try {
                sendCommentBtn.disabled = true;
                await PostService.addComment(post.id, comment);
                commentInput.value = '';

                // Yorumları yenile
                const comments = await PostService.getPostComments(post.id);
                document.querySelector('.post-detail-comments').innerHTML =
                    this.renderPostComments(comments);
            } catch (error) {
                console.error('Yorum ekleme hatası:', error);
                alert('Yorum eklenirken bir hata oluştu');
            } finally {
                sendCommentBtn.disabled = false;
            }
        });

        // Enter tuşuyla yorum gönderme
        commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendCommentBtn.click();
            }
        });

        // Beğenme butonu
        document
            .querySelector('.like-button')
            .addEventListener('click', async () => {
                try {
                    await PostService.likePost(post.id);
                    // Beğeni görseli güncelleme
                    const likeButton = document.querySelector('.like-button');
                    likeButton.querySelector('i').classList.remove('far');
                    likeButton.querySelector('i').classList.add('fas');
                    likeButton.querySelector('i').style.color = '#ed4956';
                } catch (error) {
                    console.error('Beğenme hatası:', error);
                }
            });
    }
}

export default PostDetailPage;
