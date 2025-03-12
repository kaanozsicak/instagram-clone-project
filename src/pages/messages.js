import { AuthService } from '../services/auth-service.js';
import { MessageService } from '../services/message-service.js';
import { UserService } from '../services/user-service.js';

class MessagesPage {
    static activeConversationId = null;
    static unsubscribeConversations = null;
    static unsubscribeMessages = null;

    static async render() {
        console.log('MessagesPage render başladı');
        try {
            const authUser = await AuthService.ensureCurrentUser();
            if (!authUser) {
                console.log(
                    'Kullanıcı oturumu yok, login sayfasına yönlendiriliyor'
                );
                window.location.href = '/login';
                return;
            }

            // Mevcut kullanıcının tam profilini al
            const currentUserProfile = await AuthService.getUserProfile(
                authUser.uid
            );
            console.log('Mevcut kullanıcı profili:', currentUserProfile);

            if (!currentUserProfile) {
                console.error('Kullanıcı profili bulunamadı');
                // Eğer profil yoksa, kullanıcıyı profil tamamlama sayfasına yönlendir
                window.location.href = '/complete-profile';
                return;
            }

            const appContainer = document.getElementById('app');
            if (!appContainer) {
                console.error('App container bulunamadı');
                return;
            }

            // Mesaj sayfası HTML yapısı
            appContainer.innerHTML = `
                <link rel="stylesheet" href="/src/styles/ui-components.css">
                <style>
                    .messages-page {
                        display: flex;
                        flex-direction: column;
                        max-width: 1200px;
                        margin: 0 auto;
                        height: 100vh;
                        background-color: var(--bg-color);
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                    }
                    
                    .messages-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 20px;
                        background-color: var(--card-color);
                        border-bottom: 1px solid var(--border-color);
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .messages-title {
                        font-size: 24px;
                        font-weight: 700;
                        color: var(--text-primary);
                    }
                    
                    .messages-container {
                        display: flex;
                        height: calc(100vh - 70px);
                        overflow: hidden;
                    }
                    
                    .conversations-list {
                        width: 350px;
                        background-color: var(--card-color);
                        border-right: 1px solid var(--border-color);
                        overflow-y: auto;
                    }
                    
                    .conversation-item {
                        display: flex;
                        align-items: center;
                        padding: 15px;
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                        border-bottom: 1px solid var(--border-color);
                        position: relative;
                    }
                    
                    .conversation-item:hover {
                        background-color: rgba(85, 99, 222, 0.05);
                    }
                    
                    .conversation-item.active {
                        background-color: rgba(85, 99, 222, 0.1);
                    }
                    
                    .conversation-avatar {
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        margin-right: 15px;
                        object-fit: cover;
                    }
                    
                    .conversation-info {
                        flex: 1;
                    }
                    
                    .conversation-name {
                        font-weight: 600;
                        margin-bottom: 5px;
                        color: var(--text-primary);
                        display: flex;
                        align-items: center;
                    }
                    
                    .message-preview {
                        color: var(--text-secondary);
                        font-size: 14px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 200px;
                    }
                    
                    .conversation-badge {
                        position: absolute;
                        right: 15px;
                        top: 15px;
                        background-color: var(--secondary-color);
                        color: white;
                        min-width: 20px;
                        height: 20px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: bold;
                        padding: 0 6px;
                    }
                    
                    .message-area {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        background-color: var(--bg-color);
                        position: relative;
                    }
                    
                    .no-conversation-message {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        color: var(--text-secondary);
                        padding: 20px;
                        text-align: center;
                    }
                    
                    .message-header {
                        display: flex;
                        align-items: center;
                        padding: 15px 20px;
                        background-color: var(--card-color);
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .message-list {
                        flex: 1;
                        padding: 20px;
                        overflow-y: auto;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .message-bubble {
                        max-width: 70%;
                        padding: 12px 15px;
                        border-radius: 18px;
                        margin-bottom: 10px;
                        position: relative;
                        word-break: break-word;
                    }
                    
                    .message-sent {
                        align-self: flex-end;
                        background-color: var(--primary-color);
                        color: white;
                        border-bottom-right-radius: 5px;
                    }
                    
                    .message-received {
                        align-self: flex-start;
                        background-color: var(--card-color);
                        color: var(--text-primary);
                        border-bottom-left-radius: 5px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }
                    
                    .message-input-container {
                        display: flex;
                        padding: 15px;
                        background-color: var(--card-color);
                        border-top: 1px solid var(--border-color);
                    }
                    
                    .message-input {
                        flex: 1;
                        padding: 12px 15px;
                        border: 1px solid var(--border-color);
                        border-radius: 24px;
                        font-size: 15px;
                        outline: none;
                        resize: none;
                    }
                    
                    .pending-message-actions {
                        display: flex;
                        justify-content: space-between;
                        padding: 15px;
                        background-color: #f0f2f5;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .search-users-results {
                        max-height: 300px;
                        overflow-y: auto;
                    }
                    
                    .search-user-item {
                        display: flex;
                        align-items: center;
                        padding: 10px;
                        cursor: pointer;
                        border-bottom: 1px solid var(--border-color);
                    }
                </style>
                
                <div class="messages-page">
                    <header class="messages-header">
                        <button class="btn btn-ghost btn-sm back-btn" id="back-to-home-btn">
                            <i class="fas fa-arrow-left"></i> Anasayfa
                        </button>
                        <h1 class="messages-title">Mesajlar</h1>
                        <div class="messages-actions">
                            <button class="btn btn-primary btn-sm new-message-btn" id="new-message-btn">
                                <i class="fas fa-plus"></i> Yeni Mesaj
                            </button>
                        </div>
                    </header>
                    
                    <div class="messages-container">
                        <div class="conversations-list" id="conversations-list">
                            <!-- Sohbetler buraya yüklenecek -->
                            <div style="padding: 15px; text-align: center;">
                                <div class="spinner" style="
                                    width: 40px;
                                    height: 40px;
                                    margin: 0 auto;
                                    border: 4px solid rgba(0, 0, 0, 0.1);
                                    border-left-color: var(--primary-color);
                                    border-radius: 50%;
                                    animation: spin 1s linear infinite;
                                "></div>
                                <p>Sohbetler yükleniyor...</p>
                            </div>
                        </div>
                        
                        <div class="message-area" id="message-area">
                            <div class="no-conversation-message">
                                <div class="no-conversation-icon">
                                    <i class="far fa-comments"></i>
                                </div>
                                <h3>Mesajlarınız</h3>
                                <p>Bir sohbet seçin veya yeni bir mesaj başlatın</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Yeni mesaj modalı -->
                <div id="new-message-modal" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                ">
                    <div style="
                        background-color: var(--card-color);
                        width: 90%;
                        max-width: 500px;
                        border-radius: 10px;
                        overflow: hidden;
                    ">
                        <div style="
                            padding: 15px 20px;
                            background-color: var(--primary-color);
                            color: white;
                            font-weight: 600;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        ">
                            <span>Yeni Mesaj</span>
                            <button id="close-modal" style="
                                background: none;
                                border: none;
                                color: white;
                                font-size: 20px;
                                cursor: pointer;
                            ">&times;</button>
                        </div>
                        <div style="padding: 20px;">
                            <input type="text" id="search-users-input" placeholder="Kullanıcı ara..." style="
                                width: 100%;
                                padding: 12px 15px;
                                border: 1px solid var(--border-color);
                                border-radius: 8px;
                                font-size: 15px;
                                margin-bottom: 15px;
                            ">
                            <div id="search-users-results" class="search-users-results"></div>
                        </div>
                    </div>
                </div>
            `;

            // Event Listener'ları ayarla
            this.setupEventListeners();

            // Sohbetleri yükle
            this.loadConversations();
        } catch (error) {
            console.error('Mesajlar sayfası render hatası:', error);
        }
    }

    static async setupEventListeners() {
        // Anasayfaya dön butonu
        document
            .getElementById('back-to-home-btn')
            .addEventListener('click', () => {
                window.location.href = '/home';
            });

        // Yeni mesaj butonu
        const newMessageBtn = document.getElementById('new-message-btn');
        const newMessageModal = document.getElementById('new-message-modal');
        const closeModalBtn = document.getElementById('close-modal');
        const searchUsersInput = document.getElementById('search-users-input');
        const searchUsersResults = document.getElementById(
            'search-users-results'
        );

        newMessageBtn.addEventListener('click', () => {
            newMessageModal.style.display = 'flex';
        });

        closeModalBtn.addEventListener('click', () => {
            newMessageModal.style.display = 'none';
            searchUsersInput.value = '';
            searchUsersResults.innerHTML = '';
        });

        // Kullanıcı arama ve mesaj başlatma
        searchUsersInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                searchUsersResults.innerHTML = '';
                return;
            }

            try {
                // Kullanıcılar yükleniyor göster
                searchUsersResults.innerHTML =
                    '<div style="text-align: center; padding: 15px;"><div class="spinner" style="width: 30px; height: 30px; margin: 0 auto; border: 3px solid rgba(0, 0, 0, 0.1); border-left-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div><p>Kullanıcılar aranıyor...</p></div>';

                const users = await UserService.searchUsers(query);

                if (users.length === 0) {
                    searchUsersResults.innerHTML =
                        '<div style="padding: 15px; text-align: center;">Kullanıcı bulunamadı</div>';
                    return;
                }

                // Mevcut kullanıcı durumunu al
                const currentUser = AuthService.getCurrentUser();

                // Geçerli kullanıcıları filtrele, kendinizi ve null/undefined kullanıcıları çıkar
                const filteredUsers = users.filter(
                    (user) =>
                        user &&
                        user.uid &&
                        user.uid !== currentUser.uid &&
                        user.uid !== 'undefined' &&
                        user.uid !== 'null'
                );

                if (filteredUsers.length === 0) {
                    searchUsersResults.innerHTML =
                        '<div style="padding: 15px; text-align: center;">Kullanıcı bulunamadı</div>';
                    return;
                }

                searchUsersResults.innerHTML = filteredUsers
                    .map(
                        (user) => `
                    <div class="search-user-item" data-user-id="${
                        user.uid
                    }" data-username="${user.username || ''}">
                        <img src="${
                            user.profileImage ||
                            user.profilePicture ||
                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                        }" 
                            style="width: 40px; height: 40px; border-radius: 50%; margin-right: 15px; object-fit: cover;">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${
                                user.fullName || user.username || 'Kullanıcı'
                            }</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">@${
                                user.username || 'kullanici'
                            }</div>
                        </div>
                    </div>
                `
                    )
                    .join('');

                // Kullanıcı seçme olayını ekle
                document
                    .querySelectorAll('.search-user-item')
                    .forEach((item) => {
                        item.addEventListener('click', async () => {
                            // Tıklanan kullanıcının bilgilerini al
                            const userId = item.dataset.userId;
                            const username = item.dataset.username;

                            // UserId kontrolü
                            if (
                                !userId ||
                                userId === 'undefined' ||
                                userId === 'null'
                            ) {
                                console.error('Geçersiz kullanıcı ID:', userId);
                                alert(
                                    'Geçerli bir kullanıcı seçilmedi. Lütfen tekrar deneyin.'
                                );
                                return;
                            }

                            console.log('Sohbet başlatılacak kullanıcı:', {
                                userId,
                                username,
                            });

                            // Yükleniyor göster
                            item.innerHTML =
                                '<div style="text-align: center; width: 100%;"><div class="spinner" style="width: 20px; height: 20px; margin: 0 auto; border: 2px solid rgba(0, 0, 0, 0.1); border-left-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div><p>Sohbet başlatılıyor...</p></div>';

                            try {
                                // Sohbet başlat veya mevcut sohbeti bul
                                const conversationId =
                                    await MessageService.startConversation(
                                        userId
                                    );
                                console.log(
                                    'Oluşturulan/bulunan sohbet ID:',
                                    conversationId
                                );

                                if (!conversationId) {
                                    throw new Error('Sohbet oluşturulamadı');
                                }

                                // Modalı kapat
                                newMessageModal.style.display = 'none';
                                searchUsersInput.value = '';
                                searchUsersResults.innerHTML = '';

                                // Yeni sohbeti aç
                                await this.openConversation(conversationId);

                                // Sohbetleri yenile
                                this.loadConversations();
                            } catch (error) {
                                console.error('Sohbet başlatma hatası:', error);
                                alert('Sohbet başlatılamadı: ' + error.message);

                                // Modalı kapat
                                newMessageModal.style.display = 'none';
                                searchUsersInput.value = '';
                                searchUsersResults.innerHTML = '';
                            }
                        });
                    });
            } catch (error) {
                console.error('Kullanıcı arama hatası:', error);
                searchUsersResults.innerHTML =
                    '<div style="padding: 15px; text-align: center;">Arama sırasında bir hata oluştu</div>';
            }
        });

        // Modal dışına tıklandığında kapatma
        window.onclick = (event) => {
            if (event.target === newMessageModal) {
                newMessageModal.style.display = 'none';
                searchUsersInput.value = '';
                searchUsersResults.innerHTML = '';
            }
        };
    }

    static async loadConversations() {
        const conversationsList = document.getElementById('conversations-list');

        try {
            // Önce kullanıcıyı kontrol et
            const authUser = AuthService.getCurrentUser();
            if (!authUser) {
                console.error('Kullanıcı oturumu yok');
                window.location.href = '/login';
                return;
            }

            // Dinlemeyi kapat
            if (this.unsubscribeConversations) {
                this.unsubscribeConversations();
            }

            // Canlı dinleme başlat
            this.unsubscribeConversations =
                MessageService.listenToConversations((conversations) => {
                    if (conversations.length === 0) {
                        conversationsList.innerHTML = `
                        <div style="padding: 20px; text-align: center;">
                            <p style="color: var(--text-secondary);">Henüz bir sohbetiniz yok</p>
                            <p>Yeni mesaj başlatmak için sağ üst köşedeki butonu kullanın</p>
                        </div>
                    `;
                        return;
                    }

                    conversationsList.innerHTML = conversations
                        .map((conversation) => {
                            // Tarih formatla
                            const time = conversation.lastMessageTime
                                ? this.formatMessageTime(
                                      conversation.lastMessageTime
                                  )
                                : '';

                            // Diğer kullanıcının bilgileri
                            const otherUser = conversation.otherUser || {
                                username: 'Kullanıcı',
                                fullName: '',
                            };

                            // Mesaj isteği veya normal sohbet
                            const isRequest = conversation.isMessageRequest;
                            const activeClass =
                                conversation.id === this.activeConversationId
                                    ? 'active'
                                    : '';

                            return `
                        <div class="conversation-item ${activeClass}" data-id="${
                                conversation.id
                            }" data-is-request="${isRequest}">
                            <img src="${
                                otherUser.profileImage ||
                                otherUser.profilePicture ||
                                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                            }" alt="${
                                otherUser.username
                            }" class="conversation-avatar">
                            <div class="conversation-info">
                                <div class="conversation-name">
                                    ${otherUser.fullName || otherUser.username}
                                    ${
                                        isRequest
                                            ? '<span style="margin-left:5px; color: var(--primary-color);">(İstek)</span>'
                                            : ''
                                    }
                                </div>
                                <div class="message-preview">
                                    ${conversation.lastMessage || 'Yeni sohbet'}
                                </div>
                            </div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${time}</div>
                            ${
                                conversation.unreadCount > 0
                                    ? `<div class="conversation-badge">${conversation.unreadCount}</div>`
                                    : ''
                            }
                        </div>
                    `;
                        })
                        .join('');

                    // Sohbet seçme olayını ekle
                    document
                        .querySelectorAll('.conversation-item')
                        .forEach((item) => {
                            item.addEventListener('click', () => {
                                const conversationId = item.dataset.id;
                                const isRequest =
                                    item.dataset.isRequest === 'true';

                                this.openConversation(
                                    conversationId,
                                    isRequest
                                );
                            });
                        });
                });
        } catch (error) {
            console.error('Sohbetleri yükleme hatası:', error);
            conversationsList.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <p style="color: var(--error-color);">Sohbetler yüklenemedi</p>
                    <button onclick="MessagesPage.loadConversations()" style="margin-top:10px; padding: 8px 16px; background-color: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer;">Tekrar Dene</button>
                </div>
            `;
        }
    }

    static async openConversation(conversationId, isRequest = false) {
        const messageArea = document.getElementById('message-area');
        this.activeConversationId = conversationId;

        // Dinlemeyi kapat
        if (this.unsubscribeMessages) {
            this.unsubscribeMessages();
        }

        try {
            if (!conversationId) {
                throw new Error('Geçersiz sohbet ID');
            }

            // Aktif sohbeti vurgula
            document.querySelectorAll('.conversation-item').forEach((item) => {
                item.classList.remove('active');
                if (item.dataset.id === conversationId) {
                    item.classList.add('active');
                }
            });

            // Sohbet bilgisini al
            const conversationsData =
                await MessageService.getUserConversations();
            const conversation = conversationsData.find(
                (c) => c.id === conversationId
            );

            if (!conversation) {
                console.error(`Sohbet bulunamadı, ID: ${conversationId}`);

                // Sohbet UI'ını sıfırla
                messageArea.innerHTML = `
                    <div class="no-conversation-message">
                        <div class="no-conversation-icon">
                            <i class="far fa-comments"></i>
                        </div>
                        <h3>Mesajlarınız</h3>
                        <p>Bir sohbet seçin veya yeni bir mesaj başlatın</p>
                        <p style="color: #e74c3c; margin-top: 20px;">Seçilen sohbet bulunamadı veya silindi.</p>
                    </div>
                `;

                // Sohbetleri yeniden yükleyelim
                this.loadConversations();
                return;
            }

            const otherUser = conversation.otherUser || {
                username: 'Kullanıcı',
                fullName: '',
            };

            // Okunmamış mesajları okundu olarak işaretle
            await MessageService.markConversationAsRead(conversationId);

            if (isRequest) {
                // Mesaj isteği
                messageArea.innerHTML = `
                    <div class="message-header">
                        <img src="${
                            otherUser.profileImage ||
                            otherUser.profilePicture ||
                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                        }" 
                         alt="${otherUser.username}" 
                         style="width: 40px; height: 40px; border-radius: 50%; margin-right: 15px; object-fit: cover;">
                        <span style="font-weight: 600; color: var(--text-primary);">${
                            otherUser.fullName || otherUser.username
                        }</span>
                    </div>
                    
                    <div class="pending-message-actions">
                        <div style="font-size: 14px; color: var(--text-secondary);">
                            <strong>${
                                otherUser.username
                            }</strong> size mesaj göndermek istiyor. Kabul etmek istiyor musunuz?
                        </div>
                        <div>
                            <button id="reject-request-btn" class="btn btn-danger btn-sm">Reddet</button>
                            <button id="accept-request-btn" class="btn btn-primary btn-sm">Kabul Et</button>
                        </div>
                    </div>
                    
                    <div class="message-list" id="message-list">
                        <!-- Mesajlar burada gösterilecek -->
                    </div>
                `;

                // İstek butonlarına event listener ekle
                document
                    .getElementById('accept-request-btn')
                    .addEventListener('click', async () => {
                        try {
                            await MessageService.acceptMessageRequest(
                                conversationId
                            );
                            this.openConversation(conversationId, false); // Normal sohbet görünümünü aç
                        } catch (error) {
                            console.error('Mesaj isteği kabul hatası:', error);
                            alert('İstek kabul edilirken bir hata oluştu');
                        }
                    });

                document
                    .getElementById('reject-request-btn')
                    .addEventListener('click', async () => {
                        try {
                            if (
                                confirm(
                                    'Bu mesaj isteğini reddetmek istediğinize emin misiniz?'
                                )
                            ) {
                                await MessageService.rejectMessageRequest(
                                    conversationId
                                );
                                this.loadConversations(); // Sohbetleri yeniden yükle

                                messageArea.innerHTML = `
                                <div class="no-conversation-message">
                                    <div class="no-conversation-icon">
                                        <i class="far fa-comments"></i>
                                    </div>
                                    <h3>Mesajlarınız</h3>
                                    <p>Bir sohbet seçin veya yeni bir mesaj başlatın</p>
                                </div>
                            `;

                                this.activeConversationId = null;
                            }
                        } catch (error) {
                            console.error(
                                'Mesaj isteği reddetme hatası:',
                                error
                            );
                            alert('İstek reddedilirken bir hata oluştu');
                        }
                    });
            } else {
                // Normal sohbet
                messageArea.innerHTML = `
                    <div class="message-header">
                        <img src="${
                            otherUser.profileImage ||
                            otherUser.profilePicture ||
                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4='
                        }" 
                         alt="${otherUser.username}" 
                         style="width: 40px; height: 40px; border-radius: 50%; margin-right: 15px; object-fit: cover;">
                        <span style="font-weight: 600; color: var(--text-primary);">${
                            otherUser.fullName || otherUser.username
                        }</span>
                    </div>
                    
                    <div class="message-list" id="message-list">
                        <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                            Mesajlar yükleniyor...
                            <div class="spinner" style="margin: 10px auto;"></div>
                        </div>
                    </div>
                    
                    <div class="message-input-container">
                        <textarea class="input" id="message-input" placeholder="Mesaj yazın..." rows="1"></textarea>
                        <button id="send-message-btn" class="btn btn-primary btn-icon">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                `;

                // Mesaj gönderme butonuna event listener ekle
                document
                    .getElementById('send-message-btn')
                    .addEventListener('click', () => {
                        this.sendMessage(conversationId);
                    });

                // Enter tuşu ile mesaj gönderme
                document
                    .getElementById('message-input')
                    .addEventListener('keypress', (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            this.sendMessage(conversationId);
                        }
                    });

                // Mesajları dinle
                this.unsubscribeMessages = MessageService.listenToMessages(
                    conversationId,
                    (messages) => {
                        this.renderMessages(messages);

                        // Paylaşılan gönderilere tıklama işlevselliği ekle
                        document
                            .querySelectorAll('.shared-post-compact')
                            .forEach((postElement) => {
                                postElement.addEventListener('click', () => {
                                    const postId = postElement.dataset.postId;
                                    if (postId) {
                                        window.location.href = `/post/${postId}`;
                                    }
                                });
                            });
                    }
                );
            }
        } catch (error) {
            console.error('Sohbet açma hatası:', error);

            // Hata mesajını daha detaylı göster
            messageArea.innerHTML = `
                <div class="no-conversation-message">
                    <div class="no-conversation-icon">
                        <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem;"></i>
                    </div>
                    <h3>Sohbet Açılamadı</h3>
                    <p class="alert alert-error">${
                        error.message || 'Bilinmeyen hata'
                    }</p>
                    <button id="retry-btn" class="btn btn-primary">Tekrar Dene</button>
                </div>
            `;

            // Tekrar deneme butonu
            document
                .getElementById('retry-btn')
                ?.addEventListener('click', () => {
                    this.loadConversations();
                });
        }
    }

    static async sendMessage(conversationId) {
        const messageInput = document.getElementById('message-input');
        const content = messageInput.value.trim();

        if (!content) return;

        try {
            messageInput.disabled = true;
            await MessageService.sendMessage(conversationId, content);
            messageInput.value = '';
            messageInput.focus();
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
            alert('Mesaj gönderilemedi: ' + error.message);
        } finally {
            messageInput.disabled = false;
        }
    }

    static renderMessages(messages) {
        const messageList = document.getElementById('message-list');
        const currentUser = AuthService.getCurrentUser();

        if (!currentUser || !messageList) return;

        // Sayfa aşağı doğru kaydırılacak mı kontrol et (yeni mesaj geldiğinde)
        const shouldScroll =
            messageList.scrollHeight - messageList.scrollTop ===
                messageList.clientHeight ||
            messageList.scrollTop >
                messageList.scrollHeight - messageList.clientHeight - 100;

        messageList.innerHTML = messages
            .map((message) => {
                const isSent = message.senderId === currentUser.uid;
                const messageClass = isSent
                    ? 'message-sent'
                    : 'message-received';
                const timestamp = message.createdAt
                    ? this.formatMessageTime(message.createdAt)
                    : '';

                // Paylaşılan gönderi mesajlarını işle
                if (message.type === 'shared_post') {
                    try {
                        const sharedPost = JSON.parse(message.content);
                        // Paylaşılan gönderinin HTML'ini oluştur - daha kompakt ve tıklanabilir
                        return `
                        <div class="message-bubble ${messageClass}">
                            <a href="/post/${
                                sharedPost.postId
                            }" class="shared-post-link">
                                <div class="shared-post-compact" data-post-id="${
                                    sharedPost.postId
                                }">
                                    <div class="shared-post-preview">
                                        <img src="${
                                            sharedPost.postImageUrl
                                        }" alt="Paylaşılan gönderi">
                                        <div class="shared-post-info">
                                            <span class="shared-post-username">@${
                                                sharedPost.postOwnerUsername
                                            }</span>
                                            ${
                                                sharedPost.postCaption
                                                    ? `<span class="shared-post-caption-preview">${
                                                          sharedPost.postCaption
                                                              .length > 30
                                                              ? sharedPost.postCaption.substring(
                                                                    0,
                                                                    30
                                                                ) + '...'
                                                              : sharedPost.postCaption
                                                      }</span>`
                                                    : ''
                                            }
                                        </div>
                                    </div>
                                </div>
                            </a>
                            <div class="message-time">${timestamp}</div>
                        </div>
                        `;
                    } catch (error) {
                        console.error(
                            'Paylaşılan gönderi ayrıştırma hatası:',
                            error
                        );
                        return `
                        <div class="message-bubble ${messageClass}">
                            <div class="shared-post-error">Gönderi yüklenemedi</div>
                            <div class="message-time">${timestamp}</div>
                        </div>
                        `;
                    }
                }

                // Normal metin mesajları için varsayılan format
                return `
                <div class="message-bubble ${messageClass}">
                    ${message.content}
                    <div class="message-time">${timestamp}</div>
                </div>
                `;
            })
            .join('');

        // Yeni mesaj geldiğinde sayfayı aşağı kaydır
        if (
            shouldScroll &&
            messageList.scrollHeight > messageList.clientHeight
        ) {
            messageList.scrollTop = messageList.scrollHeight;
        }
    }

    static formatMessageTime(timestamp) {
        if (!timestamp) return '';

        // Firebase timestamp ise Date objesine dönüştür
        const date = timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);

        const now = new Date();
        const diff = now - date;

        // Son 24 saat içindeyse saat göster
        if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });
        }

        // 1 hafta içindeyse gün adı göster
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            return (
                date.toLocaleDateString([], { weekday: 'short' }) +
                ' ' +
                date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })
            );
        }

        // Daha eskiyse tarih göster
        return date.toLocaleDateString();
    }
}

export default MessagesPage;
