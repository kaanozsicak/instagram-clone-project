import { AuthService } from '../services/auth-service.js';
import { FollowService } from '../services/follow-service.js';
import { PostService } from '../services/post-service.js';
import { ProfileService } from '../services/profile-service.js'; // Yeni import
import { firestore } from '../services/firebase-config.js';
import {
    collection,
    query as firestoreQuery,
    where,
    getDocs,
    limit,
} from 'firebase/firestore';

class ProfilePage {
    static async render(username = null) {
        const appContainer = document.getElementById('app');

        try {
            // Temel değişkenleri tanımla
            const pageData = {
                profileUser: null,
                isOwnProfile: false,
                followStatus: {
                    isFollowing: false,
                    isPending: false,
                },
                followersCount: 0,
                userPosts: [],
                followBtnText: 'Takip Et',
                followBtnColor: '#0095f6',
                isPrivate: false,
                canViewPosts: false,
            };

            const currentUser = await AuthService.ensureCurrentUser();
            if (!currentUser) {
                window.location.href = '/login';
                return;
            }

            // URL'den kullanıcı adını al ve profil bilgilerini yükle
            const pathParts = window.location.pathname.split('/');
            const urlUsername = pathParts[pathParts.length - 1];

            if (urlUsername === 'profile' || !urlUsername) {
                pageData.profileUser = await AuthService.getUserProfile(
                    currentUser.uid
                );
                pageData.isOwnProfile = true;
                username = pageData.profileUser.username;
            } else {
                pageData.profileUser = await this.getUserByUsername(
                    urlUsername
                );
                pageData.isOwnProfile =
                    pageData.profileUser.uid === currentUser.uid;
                username = pageData.profileUser.username;

                if (!pageData.isOwnProfile) {
                    // Takip durumunu kontrol et
                    const status = await FollowService.checkFollowRequestStatus(
                        username
                    );
                    pageData.followStatus = status;
                    pageData.followersCount =
                        await FollowService.getFollowersCount(username);

                    // Takip butonu durumunu güncelle
                    if (status.isFollowing) {
                        pageData.followBtnText = 'Takipten Çık';
                        pageData.followBtnColor = '#ff3040';
                    } else if (status.isPending) {
                        pageData.followBtnText = 'İstek Gönderildi';
                        pageData.followBtnColor = '#8e8e8e';
                    }
                }
            }

            // Gizlilik ayarlarını kontrol et
            pageData.isPrivate = await ProfileService.getPrivacySettings(
                pageData.profileUser.uid
            );
            pageData.canViewPosts =
                !pageData.isPrivate ||
                pageData.isOwnProfile ||
                pageData.followStatus.isFollowing;

            // Gönderileri yükle
            if (pageData.canViewPosts) {
                pageData.userPosts = await PostService.getUserPosts(username);
            }

            // Posts grid HTML'i oluştur
            const postsGridHTML = pageData.canViewPosts
                ? pageData.userPosts.length > 0
                    ? pageData.userPosts
                          .map(
                              (post) => `
                        <div class="post-item" data-post-id="${post.id}">
                            <img src="${post.imageUrl}" alt="Gönderi">
                        </div>
                    `
                          )
                          .join('')
                    : '<p class="no-posts">Henüz hiç gönderi yok</p>'
                : `<div class="private-account-message">
                    <p>🔒 Bu hesap gizli</p>
                    <p>Gönderileri görmek için takip etmeniz gerekiyor</p>
                   </div>`;

            // HTML template'ini render et
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
                    
                    body {
                        background-color: var(--bg-color);
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    
                    .profile-container {
                        max-width: 1000px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    
                    .profile-top-nav {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 15px 20px;
                        background-color: var(--card-color);
                        border-radius: 16px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        margin-bottom: 30px;
                        position: relative;
                    }
                    
                    .profile-top-nav::before {
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
                    
                    .back-btn {
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: var(--text-primary);
                        padding: 8px;
                        border-radius: 50%;
                        transition: all 0.2s ease;
                    }
                    
                    .back-btn:hover {
                        background-color: rgba(85, 99, 222, 0.1);
                        color: var(--primary-color);
                    }
                    
                    .search-container {
                        display: flex;
                        align-items: center;
                        background-color: #f1f3f8;
                        border-radius: 10px;
                        padding: 8px 12px;
                        width: 250px;
                        position: relative;
                    }
                    
                    .search-container i {
                        color: var(--text-secondary);
                    }
                    
                    .search-container input {
                        border: none;
                        background: none;
                        width: 100%;
                        outline: none;
                        margin-left: 10px;
                        font-size: 15px;
                        color: var(--text-primary);
                    }
                    
                    .search-results {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        width: 100%;
                        background-color: var(--card-color);
                        border: 1px solid var(--border-color);
                        border-radius: 0 0 10px 10px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                        z-index: 1000;
                        max-height: 300px;
                        overflow-y: auto;
                    }
                    
                    .search-result-item {
                        display: flex;
                        align-items: center;
                        padding: 12px;
                        cursor: pointer;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .search-result-item:last-child {
                        border-bottom: none;
                    }
                    
                    .search-result-item:hover {
                        background-color: rgba(85, 99, 222, 0.05);
                    }
                    
                    .search-result-item img {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        margin-right: 12px;
                        object-fit: cover;
                    }
                    
                    .nav-actions {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    }
                    
                    .notifications-btn {
                        font-size: 20px;
                        color: var(--text-secondary);
                        cursor: pointer;
                        transition: color 0.2s ease;
                        padding: 8px;
                        border-radius: 50%;
                    }
                    
                    .notifications-btn:hover {
                        color: var(--primary-color);
                        background-color: rgba(85, 99, 222, 0.1);
                    }
                    
                    .logout-btn {
                        background-color: var(--error-color);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: background-color 0.2s ease, transform 0.1s ease;
                    }
                    
                    .logout-btn:hover {
                        background-color: #c0392b;
                        transform: translateY(-1px);
                    }
                    
                    .profile-header {
                        display: flex;
                        align-items: center;
                        background-color: var(--card-color);
                        border-radius: 16px;
                        padding: 30px;
                        margin-bottom: 30px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        position: relative;
                    }
                    
                    .profile-header::before {
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
                    
                    .profile-image {
                        width: 150px;
                        height: 150px;
                        border-radius: 50%;
                        object-fit: cover;
                        margin-right: 30px;
                        border: 3px solid var(--primary-light);
                        padding: 3px;
                    }
                    
                    .profile-info {
                        flex-grow: 1;
                    }
                    
                    .profile-username {
                        font-size: 24px;
                        color: var(--text-primary);
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                    }
                    
                    .privacy-badge {
                        margin-left: 10px;
                        font-size: 16px;
                    }
                    
                    .profile-fullname {
                        font-size: 18px;
                        color: var (--text-secondary);
                        margin-bottom: 15px;
                    }
                    
                    .profile-bio {
                        margin-top: 10px;
                        color: var(--text-primary);
                        margin-bottom: 20px;
                    }
                    
                    .profile-stats {
                        display: flex;
                        gap: 30px;
                        margin-bottom: 20px;
                    }
                    
                    .stat-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .stat-value {
                        font-size: 18px;
                        font-weight: 600;
                        color: var(--text-primary);
                    }
                    
                    .stat-label {
                        font-size: 14px;
                        color: var(--text-secondary);
                    }
                    
                    .profile-actions {
                        margin-top: 20px;
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    }
                    
                    .edit-profile-btn {
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: background-color 0.2s ease, transform 0.1s ease;
                    }
                    
                    .edit-profile-btn:hover {
                        background-color: var(--primary-dark);
                        transform: translateY(-1px);
                    }
                    
                    .follow-btn {
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.2s ease;
                    }
                    
                    .follow-btn.following {
                        background-color: var(--error-color);
                    }
                    
                    .follow-btn.pending {
                        background-color: var(--text-secondary);
                        cursor: default;
                    }
                    
                    .settings-btn {
                        background: none;
                        border: none;
                        font-size: 20px;
                        color: var(--text-secondary);
                        cursor: pointer;
                        padding: 8px;
                        border-radius: 50%;
                        transition: all 0.2s ease;
                        margin-left: auto;
                    }
                    
                    .settings-btn:hover {
                        color: var(--primary-color);
                        background-color: rgba(85, 99, 222, 0.1);
                    }
                    
                    .posts-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;
                        margin-top: 20px;
                    }
                    
                    .post-item {
                        position: relative;
                        aspect-ratio: 1;
                        overflow: hidden;
                        border-radius: 12px;
                        cursor: pointer;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.08);
                        transition: transform 0.2s ease;
                    }
                    
                    .post-item:hover {
                        transform: translateY(-3px);
                    }
                    
                    .post-item img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    
                    .add-post-btn {
                        display: inline-block;
                        background-color: var(--primary-color);
                        color: white;
                        padding: 12px 20px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 15px;
                        margin-bottom: 20px;
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                        border: none;
                    }
                    
                    .add-post-btn:hover {
                        background-color: var(--primary-dark);
                    }
                    
                    .no-posts {
                        text-align: center;
                        color: var(--text-secondary);
                        padding: 40px 0;
                        font-style: italic;
                        background-color: var(--card-color);
                        border-radius: 16px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    }
                    
                    .private-account-message {
                        text-align: center;
                        padding: 50px 20px;
                        background-color: var(--card-color);
                        border-radius: 16px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    }
                    
                    .private-account-message p:first-child {
                        font-size: 24px;
                        margin-bottom: 10px;
                    }
                    
                    .private-account-message p:last-child {
                        color: var(--text-secondary);
                    }
                    
                    /* Modal Styles */
                    .modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background-color: rgba(0, 0, 0, 0.5);
                        z-index: 1000;
                    }
                    
                    .modal-content {
                        background-color: var(--card-color);
                        border-radius: 16px;
                        padding: 30px;
                        width: 90%;
                        max-width: 500px;
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                        position: relative;
                    }
                    
                    .modal-content h2 {
                        color: var(--primary-color);
                        margin-top: 0;
                        margin-bottom: 20px;
                    }
                    
                    .privacy-setting {
                        margin: 20px 0;
                    }
                    
                    .privacy-setting label {
                        display: flex;
                        align-items: center;
                        font-weight: 600;
                        color: var(--text-primary);
                        cursor: pointer;
                    }
                    
                    .privacy-setting input[type="checkbox"] {
                        margin-right: 10px;
                        width: 18px;
                        height: 18px;
                        accent-color: var(--primary-color);
                    }
                    
                    .setting-info {
                        color: var(--text-secondary);
                        margin-top: 8px;
                        font-size: 14px;
                    }
                    
                    .modal-content button {
                        padding: 10px 20px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        border: none;
                        margin-right: 10px;
                    }
                    
                    #save-settings {
                        background-color: var(--primary-color);
                        color: white;
                    }
                    
                    #save-settings:hover {
                        background-color: var(--primary-dark);
                    }
                    
                    #close-settings {
                        background-color: #f1f1f1;
                        color: var(--text-primary);
                    }
                    
                    /* Post Modal Styles */
                    .post-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.8);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                    }
                    
                    .post-modal-content {
                        display: flex;
                        width: 90%;
                        max-width: 1000px;
                        height: 80%;
                        background-color: var(--card-color);
                        border-radius: 16px;
                        overflow: hidden;
                    }
                    
                    .post-modal-image {
                        flex: 3;
                        background-color: #000;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    
                    .post-modal-image img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                    
                    .post-modal-details {
                        flex: 2;
                        display: flex;
                        flex-direction: column;
                        border-left: 1px solid var(--border-color);
                    }
                    
                    .post-modal-header {
                        display: flex;
                        align-items: center;
                        padding: 15px;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .post-user-avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        margin-right: 10px;
                        object-fit: cover;
                        border: 2px solid var(--primary-light);
                    }
                    
                    .post-username {
                        font-weight: bold;
                        color: var(--text-primary);
                    }
                    
                    .post-modal-caption {
                        padding: 15px;
                        border-bottom: 1px solid var(--border-color);
                        color: var(--text-primary);
                    }
                    
                    .post-modal-comments {
                        flex-grow: 1;
                        overflow-y: auto;
                        padding: 15px;
                    }
                    
                    .comment {
                        margin-bottom: 12px;
                        color: var(--text-primary);
                    }
                    
                    .comment strong {
                        margin-right: 5px;
                    }
                    
                    .post-modal-actions {
                        padding: 15px;
                        border-top: 1px solid var(--border-color);
                    }
                    
                    .like-btn {
                        background: none;
                        border: none;
                        cursor: pointer;
                        margin-bottom: 10px;
                        display: block;
                        color: var(--text-primary);
                        font-size: 16px;
                        transition: color 0.2s ease;
                        padding: 0;
                    }
                    
                    .like-btn:hover {
                        color: var(--secondary-color);
                    }
                    
                    .comment-input-container {
                        display: flex;
                        margin-top: 15px;
                    }
                    
                    .comment-input-container input {
                        flex-grow: 1;
                        border: 1px solid var(--border-color);
                        outline: none;
                        padding: 10px 15px;
                        border-radius: 8px;
                        font-size: 14px;
                        color: var(--text-primary);
                    }
                    
                    .comment-input-container button {
                        background: none;
                        border: none;
                        color: var(--primary-color);
                        font-weight: bold;
                        cursor: pointer;
                        padding: 0 10px;
                    }
                    
                    .close-modal-btn {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: none;
                        border: none;
                        color: white;
                        font-size: 30px;
                        cursor: pointer;
                        z-index: 1001;
                    }
                    
                    @media (max-width: 768px) {
                        .post-modal-content {
                            flex-direction: column;
                            height: 90%;
                        }
                        
                        .post-modal-image {
                            flex: 1;
                        }
                        
                        .posts-grid {
                            grid-template-columns: repeat(2, 1fr);
                        }
                        
                        .profile-image {
                            width: 100px;
                            height: 100px;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .posts-grid {
                            grid-template-columns: 1fr;
                        }
                        
                        .profile-header {
                            flex-direction: column;
                            text-align: center;
                        }
                        
                        .profile-image {
                            margin-right: 0;
                            margin-bottom: 20px;
                        }
                    }
                </style>
                
                <div class="profile-top-nav">
                    <button class="back-btn" id="back-btn">
                        ← 
                    </button>
                    
                    <div class="search-container">
                        <i class="fas fa-search"></i>
                        <input 
                            type="text" 
                            id="profile-search-input" 
                            placeholder="Kullanıcı ara..."
                        >
                        <div class="search-results" id="search-results" style="display: none;"></div>
                    </div>
                    
                    <div class="nav-actions">
                        <div class="notifications-btn">
                            <i class="fas fa-bell"></i>
                        </div>
                        <button class="logout-btn" id="logout-btn">Çıkış Yap</button>
                    </div>
                </div>

                <div class="profile-container">
                    <div class="profile-header">
                        <img 
                            src="${pageData.profileUser.profileImage}" 
                            alt="${pageData.profileUser.username}" 
                            class="profile-image"
                        >
                        <div class="profile-info">
                            <div class="profile-username">@${
                                pageData.profileUser.username ||
                                'Kullanıcı adı yok'
                            }
                                <span class="privacy-badge">${
                                    pageData.isPrivate ? '🔒' : '🌐'
                                }</span>
                            </div>
                            
                            <div class="profile-fullname">${
                                pageData.profileUser.fullName ||
                                'Ad Soyad belirtilmemiş'
                            }</div>
                            
                            <div class="profile-bio">${
                                pageData.profileUser.bio ||
                                'Henüz bir biyografi eklenmedi'
                            }</div>
                            
                            <div class="profile-stats">
                                <div class="stat-item">
                                    <div class="stat-value">${
                                        pageData.userPosts.length || 0
                                    }</div>
                                    <div class="stat-label">Gönderi</div>
                                </div>
                                
                                <div class="stat-item">
                                    <div class="stat-value">${
                                        pageData.followersCount || 0
                                    }</div>
                                    <div class="stat-label">Takipçi</div>
                                </div>
                            </div>
                            
                            <div class="profile-actions">
                                ${
                                    pageData.isOwnProfile
                                        ? `
                                    <button class="edit-profile-btn" id="edit-profile-btn">
                                        Profili Düzenle
                                    </button>
                                `
                                        : `
                                    <button class="follow-btn ${
                                        pageData.followStatus.isFollowing
                                            ? 'following'
                                            : pageData.followStatus.isPending
                                            ? 'pending'
                                            : ''
                                    }" id="follow-btn">
                                        ${pageData.followBtnText}
                                    </button>
                                `
                                }
                            </div>
                        </div>
                        
                        ${
                            pageData.isOwnProfile
                                ? `<button id="settings-btn" class="settings-btn">
                            ⚙️
                        </button>`
                                : ''
                        }
                    </div>

                    <!-- Ayarlar Modal -->
                    <div id="settings-modal" class="modal" style="display: none;">
                        <div class="modal-content">
                            <h2>Hesap Ayarları</h2>
                            <div class="privacy-setting">
                                <label>
                                    <input type="checkbox" id="private-account" ${
                                        pageData.isPrivate ? 'checked' : ''
                                    }>
                                    Gizli Hesap
                                </label>
                                <p class="setting-info">
                                    Gizli hesap olduğunda, sadece onayladığınız takipçiler gönderilerinizi görebilir.
                                </p>
                            </div>
                            <button id="save-settings">Kaydet</button>
                            <button id="close-settings">Kapat</button>
                        </div>
                    </div>
                    
                    <div class="profile-posts">
                        ${
                            pageData.isOwnProfile
                                ? `
                            <button class="add-post-btn" id="add-post-btn">
                                <i class="fas fa-plus"></i> Gönderi Ekle
                            </button>
                            <input type="file" id="post-file-input" accept="image/*" style="display:none;">
                        `
                                : ''
                        }
                        
                        <div class="posts-grid" id="posts-grid">
                            ${postsGridHTML}
                        </div>
                    </div>
                </div>
            `;

            // Event listener'ları ayarla
            this.setupEventListeners(pageData);
        } catch (error) {
            console.error('Profil yükleme hatası:', error);
            if (appContainer) {
                appContainer.innerHTML = `
                <div class="error-container" style="
                    text-align: center;
                    padding: 40px 20px;
                    background-color: var(--card-color);
                    border-radius: 16px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                    margin: 50px auto;
                    max-width: 500px;
                ">
                    <h2 style="color: var(--error-color);">Profil Yüklenemedi</h2>
                    <p style="color: var(--text-secondary);">${error.message}</p>
                    <button id="back-to-home" style="
                        padding: 12px 20px;
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        margin-top: 20px;
                        cursor: pointer;
                    ">
                        Ana Sayfaya Dön
                    </button>
                </div>
                `;

                document
                    .getElementById('back-to-home')
                    .addEventListener('click', () => {
                        window.location.href = '/home';
                    });
            }
        }
    }

    static setupEventListeners(pageData) {
        const backBtn = document.getElementById('back-btn');
        backBtn.addEventListener('click', () => {
            window.location.href = '/home';
        });

        const searchInput = document.getElementById('profile-search-input');
        const searchResults = document.getElementById('search-results');

        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(null, args), delay);
            };
        };

        const searchUsers = async (query) => {
            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            try {
                const usersRef = collection(firestore, 'users');
                const q = firestoreQuery(
                    usersRef,
                    where('username', '>=', query.toLowerCase()),
                    where('username', '<=', query.toLowerCase() + '\uf8ff'),
                    limit(5)
                );

                const querySnapshot = await getDocs(q);

                searchResults.innerHTML = '';

                if (querySnapshot.empty) {
                    searchResults.innerHTML =
                        '<div class="search-result-item">Kullanıcı bulunamadı</div>';
                    searchResults.style.display = 'block';
                    return;
                }

                querySnapshot.docs.forEach((doc) => {
                    const userData = doc.data();
                    const resultItem = document.createElement('div');
                    resultItem.classList.add('search-result-item');
                    resultItem.innerHTML = `
                    <img src="${
                        userData.profileImage || '/default-avatar.png'
                    }" alt="Profil">
                    <div>
                        <strong>${userData.username}</strong>
                        <p>${userData.fullName || ''}</p>
                    </div>
                `;

                    resultItem.addEventListener('click', () => {
                        window.location.href = `/profile/${userData.username}`;
                        searchResults.style.display = 'none';
                    });

                    searchResults.appendChild(resultItem);
                });

                searchResults.style.display = 'block';
            } catch (error) {
                console.error('Kullanıcı arama hatası:', error);
                searchResults.innerHTML =
                    '<div class="search-result-item">Arama sırasında hata oluştu</div>';
                searchResults.style.display = 'block';
            }
        };

        const debouncedSearch = debounce(searchUsers, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });

        // Dışarı tıklandığında arama sonuçlarını gizle
        document.addEventListener('click', (e) => {
            if (
                !searchInput.contains(e.target) &&
                !searchResults.contains(e.target)
            ) {
                searchResults.style.display = 'none';
            }
        });

        if (pageData.isOwnProfile) {
            const addPostBtn = document.getElementById('add-post-btn');
            const postFileInput = document.getElementById('post-file-input');
            const postsGrid = document.getElementById('posts-grid');

            if (!addPostBtn || !postFileInput || !postsGrid) {
                console.error('Gerekli DOM elemanları bulunamadı');
                return;
            }

            addPostBtn.addEventListener('click', () => {
                postFileInput.click();
            });

            postFileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const caption =
                            prompt('Gönderi açıklaması ekle (isteğe bağlı):') ||
                            '';
                        const newPost = await PostService.uploadPost(
                            file,
                            caption
                        );
                        console.log('Yeni post yüklendi:', newPost);

                        const postElement = document.createElement('div');
                        postElement.classList.add('post-item');
                        postElement.dataset.postId = newPost.id;
                        postElement.innerHTML = `
                        <img src="${newPost.imageUrl}" alt="Gönderi">
                    `;

                        const noPostsElement =
                            postsGrid.querySelector('.no-posts');
                        if (noPostsElement) {
                            postsGrid.removeChild(noPostsElement);
                        }

                        postsGrid.insertBefore(
                            postElement,
                            postsGrid.firstChild
                        );

                        postFileInput.value = '';
                    } catch (error) {
                        console.error('Gönderi yükleme hatası:', error);
                        alert('Gönderi yüklenirken bir hata oluştu');
                    }
                }
            });

            const settingsBtn = document.getElementById('settings-btn');
            const settingsModal = document.getElementById('settings-modal');
            const closeSettings = document.getElementById('close-settings');
            const saveSettings = document.getElementById('save-settings');
            const privateAccount = document.getElementById('private-account');

            settingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'block';
            });

            closeSettings.addEventListener('click', () => {
                settingsModal.style.display = 'none';
            });

            saveSettings.addEventListener('click', async () => {
                try {
                    await ProfileService.updatePrivacySettings(
                        pageData.profileUser.uid,
                        privateAccount.checked
                    );
                    location.reload();
                } catch (error) {
                    console.error('Ayarlar kaydedilirken hata:', error);
                    alert('Ayarlar kaydedilirken bir hata oluştu');
                }
            });
        }

        if (!pageData.isOwnProfile) {
            const followBtn = document.getElementById('follow-btn');
            if (followBtn) {
                followBtn.addEventListener('click', async () => {
                    try {
                        const followStatus =
                            await FollowService.checkFollowRequestStatus(
                                pageData.profileUser.username
                            );

                        if (followStatus.isPending) {
                            alert('Zaten takip isteği gönderilmiş');
                            return;
                        }

                        if (followStatus.isFollowing) {
                            await FollowService.unfollowUser(
                                pageData.profileUser.username
                            );
                            followBtn.textContent = 'Takip Et';
                            followBtn.style.backgroundColor = '#0095f6';
                        } else {
                            const result = await FollowService.followUser(
                                pageData.profileUser.username
                            );
                            if (result === 'pending') {
                                followBtn.textContent = 'İstek Gönderildi';
                                followBtn.style.backgroundColor = '#8e8e8e';
                            } else {
                                followBtn.textContent = 'Takipten Çık';
                                followBtn.style.backgroundColor = '#ff3040';
                            }
                        }

                        // Takipçi sayısını güncelle
                        const followersCountEl =
                            document.querySelector('.followers-count');
                        if (followersCountEl) {
                            const newCount =
                                await FollowService.getFollowersCount(
                                    pageData.profileUser.username
                                );
                            followersCountEl.textContent = `${newCount} takipçi`;
                        }
                    } catch (error) {
                        console.error('Takip işlemi hatası:', error);
                        alert('Takip işlemi sırasında bir hata oluştu');
                    }
                });
            }
        }

        const postsGrid = document.getElementById('posts-grid');
        postsGrid.addEventListener('click', async (e) => {
            const postItem = e.target.closest('.post-item');
            if (postItem) {
                const postId = postItem.dataset.postId;
                await this.openPostModal(postId);
            }
        });

        // Çıkış butonu için event listener
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    const confirmed = confirm(
                        'Çıkış yapmak istediğinizden emin misiniz?'
                    );
                    if (confirmed) {
                        await AuthService.logout();
                        window.location.href = '/login';
                    }
                } catch (error) {
                    console.error('Çıkış yapma hatası:', error);
                    alert('Çıkış yapılırken bir hata oluştu');
                }
            });
        }
    }

    static async openPostModal(postId) {
        try {
            const post = await PostService.getPostById(postId);
            const comments = await PostService.getPostComments(postId);
            const currentUser = AuthService.getCurrentUser();

            const modalHtml = `
            <div class="post-modal" id="post-modal">
                <div class="post-modal-content">
                    <div class="post-modal-image">
                        <img src="${post.imageUrl}" alt="Gönderi">
                    </div>
                    <div class="post-modal-details">
                        <div class="post-modal-header">
                            <img src="${
                                post.profileImage || '/default-avatar.png'
                            }" alt="Profil" class="post-user-avatar">
                            <span class="post-username">${post.username}</span>
                        </div>
                        <div class="post-modal-caption">
                            ${post.caption || ''}
                        </div>
                        <div class="post-modal-comments" id="post-comments">
                            ${comments
                                .map(
                                    (comment) => `
                                <div class="comment">
                                    <strong>${comment.username}</strong> ${comment.text}
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                        <div class="post-modal-actions">
                            <button class="like-btn" data-post-id="${postId}">
                                ❤️ ${post.likes || 0} Beğeni
                            </button>
                            <div class="comment-input-container">
                                <input 
                                    type="text" 
                                    id="comment-input" 
                                    placeholder="Yorum yap..."
                                >
                                <button id="send-comment-btn" data-post-id="${postId}">Gönder</button>
                            </div>
                        </div>
                    </div>
                    <button class="close-modal-btn">&times;</button>
                </div>
            </div>
        `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            const modal = document.getElementById('post-modal');
            const closeBtn = modal.querySelector('.close-modal-btn');
            const likeBtn = modal.querySelector('.like-btn');
            const sendCommentBtn = modal.querySelector('#send-comment-btn');
            const commentInput = modal.querySelector('#comment-input');

            closeBtn.addEventListener('click', () => {
                modal.remove();
            });

            likeBtn.addEventListener('click', async () => {
                try {
                    await PostService.likePost(postId);
                    likeBtn.textContent = `❤️ ${(post.likes || 0) + 1} Beğeni`;
                } catch (error) {
                    console.error('Beğeni hatası:', error);
                }
            });

            sendCommentBtn.addEventListener('click', async () => {
                const commentText = commentInput.value.trim();
                if (commentText) {
                    try {
                        const newComment = await PostService.addComment(
                            postId,
                            commentText
                        );

                        const commentsContainer =
                            document.getElementById('post-comments');
                        const commentElement = document.createElement('div');
                        commentElement.classList.add('comment');
                        commentElement.innerHTML = `
                        <strong>${newComment.username}</strong> ${newComment.text}
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

    static async getUserByUsername(username) {
        try {
            console.log('Kullanıcı aranıyor:', username);
            const usersRef = collection(firestore, 'users');
            const q = firestoreQuery(
                usersRef,
                where('username', '==', username)
            );

            const querySnapshot = await getDocs(q);
            console.log('Sorgu sonucu:', {
                empty: querySnapshot.empty,
                size: querySnapshot.size,
                username: username,
            });

            if (querySnapshot.empty) {
                throw new Error('Kullanıcı bulunamadı');
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            const profileData = {
                uid: userDoc.id,
                ...userData,
                fullName: userData.fullName || '',
                username: userData.username || '',
                bio: userData.bio || '',
                profileImage: userData.profileImage || '/default-avatar.png',
            };

            console.log('Bulunan kullanıcı profili:', profileData);
            return profileData;
        } catch (error) {
            console.error('Kullanıcı arama hatası:', error);
            throw error;
        }
    }
}

export default ProfilePage;
