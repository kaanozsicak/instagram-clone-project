import { AuthService } from '../services/auth-service.js';

export class LogoutButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .logout-btn {
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    transition: background-color 0.3s ease;
                }
                .logout-btn:hover {
                    background-color: #c82333;
                }
                .logout-btn svg {
                    margin-right: 5px;
                    width: 16px;
                    height: 16px;
                }
                .loading {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            </style>
            <button class="logout-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Çıkış Yap
            </button>
        `;
    }

    addEventListeners() {
        const button = this.shadowRoot.querySelector('.logout-btn');
        button.addEventListener('click', this.handleLogout.bind(this));
    }

    async handleLogout() {
        const button = this.shadowRoot.querySelector('.logout-btn');
        
        try {
            // Butonu devre dışı bırak ve loading state'i ekle
            button.classList.add('loading');
            button.disabled = true;

            // Çıkış işlemi
            await AuthService.logout();
            
            // Bilgilendirme toast mesajı
            this.showNotification('Çıkış işlemi başarılı', 'success');
        } catch (error) {
            // Hata durumunda kullanıcıyı bilgilendir
            this.showNotification('Çıkış sırasında bir hata oluştu', 'error');
            console.error('Çıkış hatası:', error);
            
            // Butonu tekrar aktif hale getir
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    // Bilgilendirme toast mesajı
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
        notification.style.color = 'white';
        notification.style.padding = '15px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        
        document.body.appendChild(notification);
        
        // 3 saniye sonra bildirimi kaldır
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}

// Custom element olarak tanımla
customElements.define('logout-button', LogoutButton);