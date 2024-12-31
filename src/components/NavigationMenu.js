import { AuthService } from '../services/auth-service.js';
import './LogoutButton.js'; // LogoutButton'ı import et

export class NavigationMenu extends HTMLElement {
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
                nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 20px;
                    background-color: #f1f1f1;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .nav-links {
                    display: flex;
                    align-items: center;
                }
                .nav-links a {
                    margin-right: 15px;
                    text-decoration: none;
                    color: #333;
                    font-weight: 500;
                    transition: color 0.3s ease;
                }
                .nav-links a:hover {
                    color: #007bff;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                }
                .user-name {
                    margin-right: 15px;
                    font-weight: bold;
                }
            </style>
            <nav>
                <div class="nav-links">
                    <a href="/home">Ana Sayfa</a>
                    <a href="/profile">Profil</a>
                </div>
                <div class="user-info">
                    <span class="user-name" id="userNameDisplay"></span>
                    <logout-button></logout-button>
                </div>
            </nav>
        `;
    }

    addEventListeners() {
        // Kullanıcı adını güncelle
        this.updateUserName();
    }

    updateUserName() {
        const currentUser = AuthService.getCurrentUser();
        const userNameDisplay = this.shadowRoot.getElementById('userNameDisplay');
        
        if (currentUser && currentUser.displayName) {
            userNameDisplay.textContent = currentUser.displayName;
        } else {
            userNameDisplay.textContent = 'Kullanıcı';
        }
    }
}

// Custom element olarak tanımla
customElements.define('navigation-menu', NavigationMenu);