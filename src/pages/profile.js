import { AuthService } from '../services/auth-service.js';
import { UserService } from '../services/user-service.js';
import { PostService } from '../services/post-service.js';
import { ProfileService } from '../services/profile-service.js';
import { FollowService } from '../services/follow-service.js';
import {
    collection,
    query as firestoreQuery,
    where,
    getDocs,
    limit,
    doc,
} from 'firebase/firestore';
import { firestore } from '../services/firebase-config.js'; // Import firestore from your config

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
                    ? `
                    <div class="posts-grid-container">
                        ${pageData.userPosts
                            .map(
                                (post) => `
                            <div class="post-item" data-post-id="${post.id}">
                                <div class="post-item-inner">
                                    <img src="${post.imageUrl}" alt="Gönderi">
                                    <div class="post-item-overlay">
                                        <div class="post-item-stats">
                                            <span><i class="fas fa-heart"></i> ${
                                                post.likes || 0
                                            }</span>
                                            <span><i class="fas fa-comment"></i> ${
                                                post.comments?.length || 0
                                            }</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                    `
                    : '<p class="no-posts">Henüz hiç gönderi yok</p>'
                : `<div class="private-account-message">
                    <p>🔒 Bu hesap gizli</p>
                    <p>Gönderileri görmek için takip etmeniz gerekiyor</p>
                   </div>`;

            // Add CSS for the grid
            appContainer.innerHTML = `
            <link rel="stylesheet" href="/src/styles/ui-components.css">
            <style>
                /* Header stillemesi */
                .profile-header {
                    display: flex;
                    align-items: center;
                    padding: 15px 20px;
                    background-color: var(--card-color);
                    border-bottom: 1px solid var(--border-color);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    box-shadow: var(--shadow-sm);
                }
                .profile-header .back-btn {
                    margin-right: 15px;
                }
                .profile-header .logo {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--primary-color);
                    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .profile-header .search-bar {
                    margin-left: auto;
                    position: relative;
                    width: 200px;
                }
                .profile-header .search-bar input {
                    width: 100%;
                    padding: 8px 12px;
                    border-radius: 20px;
                    border: 1px solid var(--border-color);
                    background-color: var(--gray-100);
                    font-size: 13px;
                }
                .profile-header .search-bar input:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.1);
                    background-color: #fff;
                }
                /* Profil içerik stili */
                .profile-container {
                    max-width: 935px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .profile-info {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 80px;
                    padding-bottom: 40px;
                    border-bottom: 1px solid var(--gray-200);
                    margin-bottom: 30px;
                }
                .profile-avatar {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid transparent;
                    background-image: linear-gradient(#fff, #fff), 
                                      linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    background-origin: border-box;
                    background-clip: content-box, border-box;
                }

                .profile-stats {
                    margin: 20px 0;
                    display: flex;
                    column-gap: 30px;
                }
                .profile-stat-item {
                    font-size: 16px;
                    font-weight: 400;
                }
                .profile-stat-item strong {
                    font-weight: 600;
                }
                .profile-username {
                    font-size: 28px;
                    font-weight: 300;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    color: var(--text-primary);
                }
                .verified-badge {
                    color: var(--primary-color);
                    margin-left: 8px;
                }
                .profile-fullname {
                    font-weight: 600;
                    margin-bottom: 5px;
                }
                .profile-bio {
                    margin: 10px 0;
                    color: var(--text-primary);
                    white-space: pre-line;
                }
                .profile-action-buttons {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                .follow-btn, .edit-profile-btn {
                    background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
                    color: white;
                    border: none;
                    padding: 8px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 5px rgba(46, 125, 50, 0.2);
                }

                .follow-btn:hover, .edit-profile-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(46, 125, 50, 0.3);
                }
                .unfollow-btn {
                    background: var(--gray-300);
                    color: var(--text-primary);
                }
                .pending-btn {
                    background: var(--gray-400);
                    cursor: not-allowed;
                }
                /* Profil Sekmeleri */
                .profile-tabs {
                    display: flex;
                    justify-content: center;
                    border-top: 1px solid var(--gray-200);
                    margin-bottom: 20px;
                }
                .profile-tab {
                    padding: 15px 0;
                    margin: 0 30px;
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--gray-500);
                    border-top: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                }
                .profile-tab i {
                    margin-right: 6px;
                }
                .profile-tab.active {
                    color: var(--primary-color);
                    border-top: 2px solid var(--primary-color);
                }
                .profile-tab:hover {
                    color: var(--primary-color);
                }
                /* Gönderi Grid Stili */
                .posts-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 28px;
                }
                .post-item {
                    aspect-ratio: 1/1;
                    cursor: pointer;
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.3s;
                }
                .post-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s;
                }
                .post-item:hover {
                    box-shadow: var(--shadow-md);
                }
                .post-item:hover img {
                    transform: scale(1.03);
                }
                /* Gönderi Modal Stili */
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .post-modal-content {
                    display: flex;
                    width: 85%;
                    max-width: 1000px;
                    max-height: 85vh;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .post-modal-image {
                    width: 65%;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .post-modal-image img {
                    max-width: 100%;
                    max-height: 85vh;
                    object-fit: contain;
                }
                .post-modal-info {
                    width: 35%;
                    display: flex;
                    flex-direction: column;
                }

                .post-modal-header {
                    padding: 14px;
                    border-bottom: 1px solid var(--gray-200);
                    display: flex;
                    align-items: center;
                }
                .post-modal-header img {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    margin-right: 10px;
                    border: 2px solid var(--primary-light);
                }
                .post-modal-username {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .post-modal-caption {
                    padding: 14px;
                    border-bottom: 1px solid var(--gray-200);
                    flex-grow: 1;
                    overflow-y: auto;
                }

                .post-modal-time {
                    font-size: 12px;
                    color: var(--gray-500);
                    margin-top: 10px;
                }
                .post-modal-interactions {
                    padding: 14px;
                    border-top: 1px solid var(--gray-200);
                }
                .post-modal-likes {
                    font-weight: 600;
                    margin-bottom: 10px;
                }
                .post-modal-comments {
                    max-height: 250px;
                    overflow-y: auto;
                }
                .post-comment {
                    margin-bottom: 8px;
                }
                .post-comment-username {
                    font-weight: 600;
                    margin-right: 5px;
                }
                .post-modal-add-comment {
                    display: flex;
                    align-items: center;
                    padding: 14px;
                    border-top: 1px solid var (--gray-200);
                }

                .post-modal-add-comment input {
                    flex: 1;
                    border: none;
                    outline: none;
                    background: transparent;
                    padding: 8px 0;
                }
                .post-modal-add-comment button {
                    background: none;
                    color: var (--primary-color);
                    font-weight: 600;
                    cursor: pointer;
                }
                .post-modal-add-comment button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .close-modal {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    font-size: 28px;
                    color: white;
                    cursor: pointer;
                    z-index: 1010;
                }
                /* Private Account Message */
                .private-account-message {
                    grid-column: span 3;
                    text-align: center;
                    padding: 50px;
                    background-color: var(--card-color);
                    border-radius: 10px;
                    border: 1px dashed var(--gray-300);
                }
                .private-account-message p:first-child {
                    font-size: 24px;
                    margin-bottom: 10px;
                    color: var(--primary-color);
                }
                /* Responsive */
                @media (max-width: 768px) {
                    .profile-info {
                        grid-template-columns: 1fr;
                        gap: 20px;
                        text-align: center;
                    }
                    .profile-avatar {
                        margin: 0 auto;
                    }

                    .profile-stats {
                        justify-content: center;
                    }
                    .profile-action-buttons {
                        justify-content: center;
                    }

                    .posts-grid {
                        gap: 3px;
                    }

                    .post-item {
                        border-radius: 0;
                    }

                    .post-modal-content {
                        flex-direction: column;
                        width: 95%;
                    }
                    .post-modal-image, .post-modal-info {
                        width: 100%;
                    }
                }
                /* Post Grid Layout */
                .posts-grid-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-top: 20px;
                    max-width: 935px;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .post-item {
                    position: relative;
                    width: 100%;
                    overflow: hidden;
                    border-radius: 8px;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.3s;
                }
                
                .post-item-inner {
                    aspect-ratio: 1/1;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                }
                
                .post-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }
                
                .post-item:hover {
                    box-shadow: var(--shadow-md);
                }
                
                .post-item:hover img {
                    transform: scale(1.03);
                }
                
                @media (min-width: 769px) {
                    .posts-grid-container {
                        grid-template-columns: repeat(3, minmax(280px, 1fr));
                        gap: 16px;
                    }
                    
                    .post-item-inner {
                        height: 280px;
                    }
                }
                
                @media (max-width: 768px) {
                    .posts-grid-container {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                    }
                    
                    .post-item-inner {
                        height: 220px;
                    }
                }
                
                @media (max-width: 480px) {
                    .posts-grid-container {
                        grid-template-columns: repeat(1, 1fr);
                        gap: 12px;
                    }
                    
                    .post-item-inner {
                        height: 320px;
                    }
                }
            </style>
            
            <!-- Header -->
            <header class="profile-header">
                <button id="back-btn" class="btn btn-ghost btn-icon back-btn">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h1 class="logo">Photogram</h1>
                <div class="search-bar">
                    <input 
                        type="text" 
                        id="profile-search-input" 
                        placeholder="Ara" 
                        autocomplete="off"
                    >
                    <div id="search-results" class="search-results" style="display: none;"></div>
                </div>
            </header>
            <div class="profile-container">
                <!-- Profil Bilgisi -->
                <div class="profile-info">
                    <img 
                        src="${
                            pageData.profileUser.profileImage ||
                            pageData.profileUser.profilePicture ||
                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                        }" 
                        alt="${pageData.profileUser.username}" 
                        class="profile-avatar"
                    >
                    <div class="profile-details">
                        <h1 class="profile-username">
                            ${pageData.profileUser.username}
                            ${
                                pageData.profileUser.isVerified
                                    ? '<i class="fas fa-check-circle verified-badge"></i>'
                                    : ''
                            }
                            ${
                                pageData.isPrivate
                                    ? '<span style="font-size: 16px; margin-left: 10px; color: var(--gray-600);"><i class="fas fa-lock"></i> Gizli Hesap</span>'
                                    : ''
                            }
                        </h1>
                        <div class="profile-stats">
                            <div class="profile-stat-item">
                                <strong>${
                                    pageData.userPosts?.length || 0
                                }</strong> gönderi
                            </div>
                            <div class="profile-stat-item">
                                <strong>${
                                    pageData.followersCount || 0
                                }</strong> takipçi
                            </div>
                            <div class="profile-stat-item">
                                <strong>${
                                    pageData.followingCount || 0
                                }</strong> takip
                            </div>
                        </div>
                        
                        <div class="profile-fullname">
                            ${pageData.profileUser.fullName || ''}
                        </div>
                        <div class="profile-bio">
                            ${pageData.profileUser.bio || ''}
                        </div>
                        
                        <div class="profile-action-buttons">
                            ${
                                pageData.isOwnProfile
                                    ? `<button class="edit-profile-btn" id="edit-profile-btn">Profili Düzenle</button>
                                   <button class="btn btn-light" id="logout-btn">Çıkış Yap</button>`
                                    : `<button 
                                    class="follow-btn ${
                                        pageData.followStatus.isPending
                                            ? 'pending-btn'
                                            : pageData.followStatus.isFollowing
                                            ? 'unfollow-btn'
                                            : ''
                                    }" 
                                    id="follow-btn"
                                    ${
                                        pageData.followStatus.isPending
                                            ? 'disabled'
                                            : ''
                                    }
                                >
                                    ${pageData.followBtnText}
                                </button>
                                <button class="btn btn-light" id="message-btn">Mesaj</button>`
                            }
                        </div>
                    </div>
                </div>
                <!-- Profil Sekmeleri -->
                <div class="profile-tabs">
                    <div class="profile-tab active">
                        <i class="fas fa-th"></i> GÖNDERİLER
                    </div>
                    ${
                        pageData.isOwnProfile
                            ? `<div class="profile-tab">
                                <i class="far fa-bookmark"></i> KAYDEDİLENLER
                               </div>`
                            : ''
                    }
                    <div class="profile-tab">
                        <i class="fas fa-user-tag"></i> ETİKETLENENLER
                    </div>
                </div>
                <!-- Gönderi Grid -->
                <div id="posts-grid" class="posts-grid">
                    ${postsGridHTML}
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
        console.log('setupEventListeners başlatılıyor...');
        // Back butonu için listener ekle
        const backBtn = document.getElementById('back-btn');
        if (!backBtn) {
            console.error('back-btn elementi bulunamadı');
        } else {
            backBtn.addEventListener('click', () => {
                window.location.href = '/home';
            });
        }

        // Arama işlevselliği
        const searchInput = document.getElementById('profile-search-input');
        const searchResults = document.getElementById('search-results');

        if (!searchInput || !searchResults) {
            console.warn(
                'Arama alanı elementleri eksik, arama işlevselliği devre dışı bırakılıyor'
            );
        } else {
            const debounce = (func, delay) => {
                let timeoutId;
                return (...args) => {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => func(...args), delay);
                };
            };

            const searchUsers = async (query) => {
                if (query.length < 2) {
                    searchResults.style.display = 'none';
                    return;
                }

                try {
                    searchResults.style.display = 'block';
                    searchResults.innerHTML =
                        '<div style="padding: 10px; text-align: center;">Aranıyor...</div>';

                    const users = await UserService.searchUsers(query);

                    if (users.length === 0) {
                        searchResults.innerHTML =
                            '<div style="padding: 10px; text-align: center;">Kullanıcı bulunamadı</div>';
                        return;
                    }

                    // Profil fotoğraflarının boyutunu küçülttük
                    searchResults.innerHTML = users
                        .map(
                            (user) => `
                        <div class="search-result-item" data-username="${
                            user.username
                        }">
                            <img src="${
                                user.profileImage ||
                                user.profilePicture ||
                                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                            }" alt="${user.username}" 
                                style="width: 32px; height: 32px; border-radius: 50%; margin-right: 10px; object-fit: cover;">
                            <div>
                                <div class="search-username">${
                                    user.username
                                }</div>
                                <div class="search-fullname">${
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
                } catch (error) {
                    console.error('Arama hatası:', error);
                    searchResults.innerHTML =
                        '<div style="padding: 10px; text-align: center;">Arama sırasında bir hata oluştu</div>';
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
        }

        // Profil işlemleri
        if (pageData.isOwnProfile) {
            // Edit profil butonu
            const editProfileBtn = document.getElementById('edit-profile-btn');
            if (editProfileBtn) {
                editProfileBtn.addEventListener('click', async () => {
                    try {
                        await this.showProfileEditModal(pageData.profileUser);
                    } catch (error) {
                        console.error('Profil düzenleme hatası:', error);
                    }
                });
            } else {
                console.warn('edit-profile-btn elementi bulunamadı');
            }

            // Ayarlar butonu ekle
            const actionButtons = document.querySelector(
                '.profile-action-buttons'
            );
            if (actionButtons) {
                const settingsBtn = document.createElement('button');
                settingsBtn.id = 'settings-btn';
                settingsBtn.className = 'btn btn-light';
                settingsBtn.innerHTML = '<i class="fas fa-cog"></i> Ayarlar';
                actionButtons.appendChild(settingsBtn);

                // Ayarlar modalı için HTML
                const settingsModalHtml = `
                    <div id="settings-modal" class="modal" style="display: none;">
                        <div class="modal-content">
                            <h3>Gizlilik Ayarları</h3>
                            <div class="privacy-setting">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <strong>Gizli Hesap</strong>
                                        <p class="setting-info">
                                            Gizli hesap seçeneğini etkinleştirdiğinizde, gönderileriniz yalnızca takipçileriniz tarafından görülebilir.
                                        </p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="private-account" ${
                                            pageData.isPrivate ? 'checked' : ''
                                        }>
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                            </div>
                            <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                                <button id="close-settings" class="btn btn-light">İptal</button>
                                <button id="save-settings" class="btn btn-primary" style="margin-left: 10px;">Kaydet</button>
                            </div>
                        </div>
                    </div>
                `;

                document.body.insertAdjacentHTML(
                    'beforeend',
                    settingsModalHtml
                );

                // Ayarlar butonu için event listener
                settingsBtn.addEventListener('click', () => {
                    document.getElementById('settings-modal').style.display =
                        'flex';
                });

                // Modal kapatma için
                document
                    .getElementById('close-settings')
                    .addEventListener('click', () => {
                        document.getElementById(
                            'settings-modal'
                        ).style.display = 'none';
                    });

                // Ayarları kaydetme
                document
                    .getElementById('save-settings')
                    .addEventListener('click', async () => {
                        try {
                            const privateAccount =
                                document.getElementById(
                                    'private-account'
                                ).checked;

                            // ProfileService ile gizlilik ayarını güncelle
                            await ProfileService.updatePrivacySettings(
                                pageData.profileUser.uid,
                                privateAccount
                            );

                            // Sayfayı yenile
                            window.location.reload();
                        } catch (error) {
                            console.error('Ayarlar kaydedilirken hata:', error);
                            alert('Ayarlar kaydedilemedi');
                        }
                    });
            }
        }

        if (!pageData.isOwnProfile) {
            const followBtn = document.getElementById('follow-btn');
            if (followBtn) {
                followBtn.addEventListener('click', async () => {
                    try {
                        followBtn.disabled = true;

                        if (followBtn.classList.contains('unfollow-btn')) {
                            // Takibi bırak
                            await FollowService.unfollowUser(
                                pageData.profileUser.username
                            );
                            followBtn.textContent = 'Takip Et';
                            followBtn.classList.remove('unfollow-btn');
                        } else if (
                            !followBtn.classList.contains('pending-btn')
                        ) {
                            // Takip et veya istek gönder
                            const result = await FollowService.followUser(
                                pageData.profileUser.username
                            );

                            if (result === 'pending') {
                                followBtn.textContent = 'İstek Gönderildi';
                                followBtn.classList.add('pending-btn');
                            } else {
                                followBtn.textContent = 'Takibi Bırak';
                                followBtn.classList.add('unfollow-btn');
                            }
                        }
                    } catch (error) {
                        console.error('Takip etme hatası:', error);
                        alert('İstek işlenirken bir hata oluştu');
                    } finally {
                        followBtn.disabled = false;
                    }
                });
            } else {
                console.warn('follow-btn elementi bulunamadı');
            }
        }

        // Gönderi ızgarası için event listener
        const postsGrid = document.getElementById('posts-grid');
        if (postsGrid) {
            postsGrid.addEventListener('click', async (e) => {
                const target = e.target;
                const postItem = e.target.closest('.post-item');
                if (postItem) {
                    const postId = postItem.dataset.postId;
                    if (target !== postsGrid) {
                        if (postId) {
                            console.log('Gönderi açılıyor:', postId);
                            await this.openPostModal(postId);
                        } else {
                            console.warn('Post ID bulunamadı!');
                        }
                    }
                }
            });
        } else {
            console.warn('posts-grid elementi bulunamadı');
        }

        // Çıkış butonu
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await AuthService.logout();
                    window.location.href = '/login';
                } catch (error) {
                    console.error('Çıkış hatası:', error);
                }
            });
        } else {
            console.warn('logout-btn elementi bulunamadı');
        }

        console.log('setupEventListeners tamamlandı');
    }

    /**
     * Profil düzenleme modalını gösterir
     * @param {Object} profileData - Profil verileri
     */
    static async showProfileEditModal(profileData) {
        const modalHtml = `
            <div class="modal" id="profile-edit-modal">
                <div class="modal-content">
                    <h2>Profil Düzenle</h2>
                    <div class="profile-image-upload" style="text-align: center; margin-bottom: 20px;">
                        <img 
                            src="${
                                profileData.profileImage ||
                                profileData.profilePicture ||
                                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                            }" 
                            alt="${profileData.username}" 
                            id="profile-image-preview"
                            style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-light); margin-bottom: 15px;"
                        >
                        <input type="file" id="profile-image-input" accept="image/*" style="display: none;">
                        <button 
                            id="change-profile-image-btn"
                            style="
                                background-color: var(--primary-color);
                                color: white;
                                border: none;
                                padding: 8px 14px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                            "
                        >
                            Profil Resmini Değiştir
                        </button>
                    </div>
                    <form id="profile-edit-form">
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label for="fullName" style="display: block; margin-bottom: 5px; font-weight: 500;">Ad Soyad</label>
                            <input 
                                type="text" 
                                id="fullName" 
                                value="${profileData.fullName || ''}" 
                                style="
                                    width: 100%;
                                    padding: 10px 12px;
                                    border: 1px solid var(--border-color);
                                    border-radius: 8px;
                                    font-size: 15px;
                                "
                            >
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label for="username" style="display: block; margin-bottom: 5px; font-weight: 500;">Kullanıcı Adı</label>
                            <input 
                                type="text" 
                                id="username" 
                                value="${profileData.username}" 
                                style="
                                    width: 100%;
                                    padding: 10px 12px;
                                    border: 1px solid var (--border-color);
                                    border-radius: 8px;
                                    font-size: 15px;
                                "
                            >
                            <small id="username-status" style="font-size: 12px; margin-top: 5px; display: block;"></small>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label for="bio" style="display: block; margin-bottom: 5px; font-weight: 500;">Biyografi</label>
                            <textarea 
                                id="bio" 
                                rows="4" 
                                style="
                                    width: 100%;
                                    padding: 10px 12px;
                                    border: 1px solid var(--border-color);
                                    border-radius: 8px;
                                    font-size: 15px;
                                    resize: vertical;
                                "
                            >${profileData.bio || ''}</textarea>
                        </div>
                        <div class="buttons" style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button 
                                type="button" 
                                id="cancel-edit-btn"
                                style="
                                    background-color: #f1f1f1;
                                    color: var(--text-secondary);
                                    border: none;
                                    padding: 10px 16px;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-weight: 600;
                                "
                            >
                                İptal
                            </button>
                            <button 
                                type="submit" 
                                id="save-profile-btn"
                                style="
                                    background-color: var(--primary-color);
                                    color: white;
                                    border: none;
                                    padding: 10px 16px;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-weight: 600;
                                "
                            >
                                Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById('profile-edit-modal');
        const profileImageInput = document.getElementById(
            'profile-image-input'
        );
        const changeProfileImageBtn = document.getElementById(
            'change-profile-image-btn'
        );
        const profileImagePreview = document.getElementById(
            'profile-image-preview'
        );
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        const profileEditForm = document.getElementById('profile-edit-form');
        const usernameInput = document.getElementById('username');
        const usernameStatus = document.getElementById('username-status');

        let selectedProfileImage = null;
        let originalUsername = profileData.username;
        let isUsernameAvailable = true;

        // Profil resmi değiştirme butonu event listener
        changeProfileImageBtn.addEventListener('click', () => {
            profileImageInput.click();
        });

        // Profil resmi yükleme
        profileImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedProfileImage = file;
                const reader = new FileReader();
                reader.onload = function (event) {
                    profileImagePreview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Kullanıcı adı değişikliğini kontrol et
        usernameInput.addEventListener('input', async (e) => {
            const newUsername = e.target.value.trim();

            if (newUsername === originalUsername) {
                usernameStatus.textContent = '';
                isUsernameAvailable = true;
                return;
            }

            if (newUsername.length < 3) {
                usernameStatus.textContent =
                    'Kullanıcı adı en az 3 karakter olmalıdır';
                usernameStatus.style.color = 'red';
                isUsernameAvailable = false;
                return;
            }

            const usernameRegex = /^[a-z0-9_]+$/;
            if (!usernameRegex.test(newUsername)) {
                usernameStatus.textContent =
                    'Kullanıcı adı sadece küçük harf, rakam ve alt çizgi içerebilir';
                usernameStatus.style.color = 'red';
                isUsernameAvailable = false;
                return;
            }

            usernameStatus.textContent = 'Kontrol ediliyor...';
            usernameStatus.style.color = '#666';

            try {
                const { AuthService } = await import(
                    '../services/auth-service.js'
                );
                const available = await AuthService.checkUsernameAvailability(
                    newUsername
                );

                if (available) {
                    usernameStatus.textContent = '✓ Kullanıcı adı uygun';
                    usernameStatus.style.color = 'green';
                    isUsernameAvailable = true;
                } else {
                    usernameStatus.textContent =
                        '✗ Bu kullanıcı adı zaten kullanılıyor';
                    usernameStatus.style.color = 'red';
                    isUsernameAvailable = false;
                }
            } catch (error) {
                console.error('Kullanıcı adı kontrolü hatası:', error);
                usernameStatus.textContent =
                    'Kontrol sırasında bir hata oluştu';
                usernameStatus.style.color = 'red';
                isUsernameAvailable = false;
            }
        });

        // İptal butonu event listener
        cancelEditBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Form gönderimi event listener
        profileEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = document.getElementById('fullName').value.trim();
            const username = document.getElementById('username').value.trim();
            const bio = document.getElementById('bio').value.trim();

            // Kullanıcı adı kontrolleri
            if (username !== originalUsername && !isUsernameAvailable) {
                alert('Lütfen geçerli bir kullanıcı adı seçin');
                return;
            }

            try {
                // Butonları devre dışı bırak ve yükleniyor göster
                const saveButton = document.getElementById('save-profile-btn');
                const cancelButton = document.getElementById('cancel-edit-btn');
                saveButton.disabled = true;
                cancelButton.disabled = true;
                saveButton.textContent = 'Kaydediliyor...';

                const { AuthService } = await import(
                    '../services/auth-service.js'
                );

                // Profil verilerini güncelle
                const updatedProfileData = {
                    fullName,
                    username: username.toLowerCase(),
                    bio,
                };

                await AuthService.updateUserProfile(
                    profileData.uid,
                    updatedProfileData,
                    selectedProfileImage
                );

                // Başarı mesajı göster
                alert('Profil başarıyla güncellendi');

                // Sayfayı yenile
                window.location.reload();
            } catch (error) {
                console.error('Profil güncelleme hatası:', error);
                alert(
                    'Profil güncellenirken bir hata oluştu: ' + error.message
                );
            } finally {
                // Hata durumunda butonları tekrar aktifleştir
                const saveButton = document.getElementById('save-profile-btn');
                const cancelButton = document.getElementById('cancel-edit-btn');
                saveButton.disabled = false;
                cancelButton.disabled = false;
                saveButton.textContent = 'Kaydet';
            }
        });
    }

    static async openPostModal(postId) {
        try {
            const post = await PostService.getPostById(postId);
            if (!post) {
                alert('Gönderi bulunamadı');
                return;
            }
            
            const comments = await PostService.getPostComments(postId);
            
            // Create the modal HTML with proper styling
            const modalHtml = `
                <div class="modal" id="post-modal">
                    <div class="modal-content post-modal-content">
                        <span class="close-modal">&times;</span>
                        <div class="post-modal-container">
                            <div class="post-modal-image">
                                <img src="${post.imageUrl}" alt="${post.caption || 'Gönderi'}">
                            </div>
                            <div class="post-modal-sidebar">
                                <div class="post-modal-header">
                                    <img src="${post.profileImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='}" alt="${post.username}">
                                    <span class="username">${post.username}</span>
                                </div>
                                
                                <div class="post-modal-comments">
                                    <div class="post-caption">
                                        <img src="${post.profileImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='}" alt="${post.username}">
                                        <div>
                                            <span class="username">${post.username}</span>
                                            <span class="caption-text">${post.caption || ''}</span>
                                            <div class="post-time">${this.formatPostTime(post.createdAt)}</div>
                                        </div>
                                    </div>
                                    ${comments.map(comment => `
                                        <div class="post-comment">
                                            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4=" alt="${comment.username}">
                                            <div>
                                                <span class="username">${comment.username}</span>
                                                <span class="comment-text">${comment.text}</span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                
                                <div class="post-modal-actions">
                                    <div class="post-action-buttons">
                                        <button class="like-button" data-post-id="${post.id}">
                                            <i class="far fa-heart"></i>
                                        </button>
                                        <button class="comment-button" data-post-id="${post.id}">
                                            <i class="far fa-comment"></i>
                                        </button>
                                        <button class="share-button" data-post-id="${post.id}">
                                            <i class="far fa-paper-plane"></i>
                                        </button>
                                    </div>
                                    <div class="post-likes">${post.likes || 0} beğenme</div>
                                </div>
                                
                                <div class="post-modal-comment-form">
                                    <input type="text" class="comment-input" placeholder="Yorum ekle...">
                                    <button class="post-comment-button" data-post-id="${post.id}">Paylaş</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Modal'ı doğrudan document.body'ye ekle
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHtml;
            document.body.appendChild(modalContainer.firstElementChild);
            
            // Stil için yeni bir stil etiketi oluştur
            const style = document.createElement('style');
            style.id = 'post-modal-styles';
            style.textContent = `
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                
                .post-modal-content {
                    max-width: 1100px;
                    width: 90%;
                    height: 90vh;
                    max-height: 700px;
                    padding: 0;
                    display: flex;
                    background: transparent;
                    position: relative;
                    border: none;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
                }
                
                .post-modal-container {
                    display: flex;
                    width: 100%;
                    height: 100%;
                }
                
                .close-modal {
                    position: absolute;
                    right: 20px;
                    top: 20px;
                    font-size: 28px;
                    color: white;
                    cursor: pointer;
                    z-index: 10;
                    text-shadow: 0 0 3px rgba(0,0,0,0.5);
                    opacity: 0.8;
                    transition: all 0.2s ease;
                    background: none;
                    border: none;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: rgba(0, 0, 0, 0.4);
                }
                
                .close-modal:hover {
                    opacity: 1;
                    background-color: rgba(0, 0, 0, 0.6);
                    transform: scale(1.1);
                }
                
                .post-modal-image {
                    flex: 1;
                    background-color: rgb(15, 15, 15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    position: relative;
                    border: none;
                    /* Removed the border radius from left side */
                }
                
                .post-modal-image img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    z-index: 0;
                }
                
                .post-modal-sidebar {
                    width: 380px;
                    display: flex;
                    flex-direction: column;
                    background: white;
                    border-left: 1px solid rgba(0, 0, 0, 0.1);
                    border-top-right-radius: 12px;
                    border-bottom-right-radius: 12px;
                }
                
                .post-modal-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    background-color: #fff;
                }
                
                .post-modal-header img {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    margin-right: 12px;
                    object-fit: cover;
                }
                
                .post-modal-comments {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px 16px;
                    background-color: white;
                }
                
                .post-caption, .post-comment {
                    display: flex;
                    margin-bottom: 15px;
                }
                
                .post-caption img, .post-comment img {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    margin-right: 12px;
                    object-fit: cover;
                    align-self: flex-start;
                }
                
                .username {
                    font-weight: 600;
                    margin-right: 5px;
                }
                
                .caption-text, .comment-text {
                    color: #262626;
                }
                
                .post-time {
                    font-size: 12px;
                    color: #8e8e8e;
                    margin-top: 4px;
                }
                
                .post-modal-actions {
                    padding: 12px 16px;
                    border-top: 1px solid rgba(0,0,0,0.1);
                    background-color: white;
                }
                
                .post-action-buttons {
                    display: flex;
                    margin-bottom: 8px;
                }
                
                .post-action-buttons button {
                    background: none;
                    border: none;
                    font-size: 24px;
                    padding: 4px;
                    margin-right: 16px;
                    cursor: pointer;
                    color: #262626;
                    transition: transform 0.2s ease;
                }
                
                .post-action-buttons button:hover {
                    transform: scale(1.1);
                }
                
                .like-button:hover i {
                    color: #ed4956;
                }
                
                .post-likes {
                    font-weight: 600;
                    margin-bottom: 8px;
                    font-size: 15px;
                }
                
                .post-modal-comment-form {
                    display: flex;
                    padding: 12px 16px;
                    border-top: 1px solid rgba(0,0,0,0.1);
                    background-color: white;
                    align-items: center;
                    border-bottom-right-radius: 12px;
                }
                
                .comment-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    padding: 8px 0;
                    font-size: 15px;
                }
                
                .post-comment-button {
                    background: none;
                    border: none;
                    color: var(--primary-color);
                    font-weight: 600;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                    padding: 8px;
                }
                
                .post-comment-button:hover {
                    opacity: 1;
                }
                
                @media (max-width: 768px) {
                    .post-modal-container {
                        flex-direction: column;
                    }
                    
                    .post-modal-content {
                        height: auto;
                        max-height: 90vh;
                        width: 95%;
                    }
                    
                    .post-modal-image {
                        height: 50vh;
                        border-top-left-radius: 12px;
                        border-top-right-radius: 12px;
                        border-bottom-left-radius: 0;
                    }
                    
                    .post-modal-sidebar {
                        width: 100%;
                        max-height: 40vh;
                        border-bottom-left-radius: 12px;
                        border-bottom-right-radius: 12px;
                        border-top-right-radius: 0;
                    }
                    
                    .close-modal {
                        right: 10px;
                        top: 10px;
                    }
                }
            `;
            document.head.appendChild(style);
            
            // Setup event listeners for modal
            const modal = document.getElementById('post-modal');
            const closeButton = modal.querySelector('.close-modal');
            const commentInput = modal.querySelector('.comment-input');
            const commentButton = modal.querySelector('.post-comment-button');
            const likeButton = modal.querySelector('.like-button');
            
            // Close modal - stili ve modal elementini tamamen kaldırarak
            closeButton.addEventListener('click', () => {
                const styleElement = document.getElementById('post-modal-styles');
                if (styleElement) styleElement.remove();
                if (modal) modal.remove();
            });
            
            // Click outside to close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    const styleElement = document.getElementById('post-modal-styles');
                    if (styleElement) styleElement.remove();
                    modal.remove();
                }
            });

            // Like post
            likeButton.addEventListener('click', async () => {
                try {
                    await PostService.likePost(postId);
                    const heartIcon = likeButton.querySelector('i');
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas');
                    heartIcon.style.color = '#ed4956';
                    
                    const likesDiv = modal.querySelector('.post-likes');
                    const currentLikes = parseInt(likesDiv.textContent.split(' ')[0]);
                    likesDiv.textContent = `${currentLikes + 1} beğenme`;
                } catch (error) {
                    console.error('Beğenme hatası:', error);
                }
            });
            
            // Add comment
            commentButton.addEventListener('click', async () => {
                const text = commentInput.value.trim();
                if (!text) return;
                
                try {
                    commentButton.disabled = true;
                    await PostService.addComment(postId, text);
                    
                    // Add the new comment to UI
                    const commentsContainer = modal.querySelector('.post-modal-comments');
                    const currentUser = AuthService.getCurrentUser();
                    const userProfile = await AuthService.getUserProfile(currentUser.uid);
                    
                    const newCommentHTML = `
                        <div class="post-comment">
                            <img src="${userProfile?.profileImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='}" alt="${userProfile?.username || 'Kullanıcı'}">
                            <div>
                                <span class="username">${userProfile?.username || 'Kullanıcı'}</span>
                                <span class="comment-text">${text}</span>
                            </div>
                        </div>
                    `;
                    commentsContainer.innerHTML += newCommentHTML;
                    commentInput.value = '';
                    commentsContainer.scrollTop = commentsContainer.scrollHeight;
                } catch (error) {
                    console.error('Yorum ekleme hatası:', error);
                    alert('Yorum eklenirken bir hata oluştu');
                } finally {
                    commentButton.disabled = false;
                }
            });
            
            // Enter key for comment input
            commentInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !commentButton.disabled) {
                    e.preventDefault();
                    commentButton.click();
                }
            });
            
            // Focus comment input when comment button is clicked
            modal.querySelector('.comment-button').addEventListener('click', () => {
                commentInput.focus();
            });
            
        } catch (error) {
            console.error('Gönderi modalı açma hatası:', error);
            alert('Gönderi detayları yüklenirken bir hata oluştu');
        }
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

        if (diffSecs < 60) {
            return 'şimdi';
        }
        if (diffMins < 60) {
            return `${diffMins} dakika önce`;
        }
        if (diffHours < 24) {
            return `${diffHours} saat önce`;
        }
        if (diffDays < 7) {
            return `${diffDays} gün önce`;
        }

        return date.toLocaleDateString();
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
                profileImage:
                    userData.profileImage ||
                    userData.profilePicture ||
                    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4=',
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
