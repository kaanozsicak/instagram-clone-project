import { AuthService } from '../services/auth-service.js';
import { StoryService } from '../services/story-service.js';

export class StoryComponent {
    static async render() {
        const storiesContainer = document.getElementById('stories-container');
        const user = await AuthService.getCurrentUser();

        // Kullanıcının ve takip ettiği kullanıcıların hikayelerini getir
        const userStories = await StoryService.fetchUserStories(user.uid);

        storiesContainer.innerHTML = `
            <link rel="stylesheet" href="/styles/theme.css">
            <style>
                .stories-wrapper {
                    display: flex;
                    gap: 15px;
                    overflow-x: auto;
                    padding: 10px 0;
                    scrollbar-width: thin;
                    scrollbar-color: var(--primary-light) transparent;
                }
                
                .stories-wrapper::-webkit-scrollbar {
                    height: 6px;
                }
                
                .stories-wrapper::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .stories-wrapper::-webkit-scrollbar-thumb {
                    background-color: var(--primary-light);
                    border-radius: 3px;
                }
                
                .story-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    flex: 0 0 auto;
                }
                
                .story-image-container {
                    position: relative;
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    padding: 2px;
                    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                    margin-bottom: 5px;
                }
                
                .story-image-container img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid white;
                    box-sizing: border-box;
                }
                
                .add-story-icon {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 24px;
                    height: 24px;
                    background-color: var(--primary-color);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    box-shadow: 0 0 0 2px white;
                }
                
                .story-viewed-indicator {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border-radius: 50%;
                    border: 2px solid var(--border-color);
                    pointer-events: none;
                }
                
                .story-item span {
                    font-size: 12px;
                    color: var(--text-primary);
                    max-width: 70px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .story-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.9);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .story-modal-content {
                    position: relative;
                    max-width: 400px;
                    width: 100%;
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                }
                
                .story-progress-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 3px;
                    width: 0;
                    background-color: white;
                }
                
                .story-image-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .story-user-info {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    display: flex;
                    align-items: center;
                    color: white;
                }
                
                .story-user-info img {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    margin-right: 10px;
                }
                
                .story-time {
                    margin-left: 10px;
                    font-size: 12px;
                    opacity: 0.7;
                }
                
                .close-story-modal {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                }
            </style>
            <div class="stories-wrapper">
                <div class="story-item add-story">
                    <div class="story-image-container">
                        <img 
                            src="${user.profileImage || '/default-avatar.png'}" 
                            alt="Hikaye Ekle"
                        >
                        <div class="add-story-icon">+</div>
                    </div>
                    <span>Hikaye Ekle</span>
                    <input 
                        type="file" 
                        id="story-upload" 
                        accept="image/*" 
                        style="display:none;"
                    >
                </div>

                ${userStories
                    .map(
                        (story) => `
                    <div class="story-item" data-story-id="${story.id}">
                        <div class="story-image-container">
                            <img src="${story.imageUrl}" alt="Hikaye">
                            <div class="story-viewed-indicator"></div>
                        </div>
                        <span>${story.username || 'Kullanıcı'}</span>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;

        this.setupEventListeners();
    }

    static setupEventListeners() {
        const addStoryBtn = document.querySelector('.add-story');
        const storyUpload = document.getElementById('story-upload');
        const storiesWrapper = document.querySelector('.stories-wrapper');

        // Hikaye ekleme butonu
        addStoryBtn.addEventListener('click', () => {
            storyUpload.click();
        });

        // Hikaye yükleme
        storyUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const storyUrl = await StoryService.createStory(file);

                    // Yeni hikayeyi dinamik olarak ekle
                    const newStoryElement = document.createElement('div');
                    newStoryElement.classList.add('story-item');
                    newStoryElement.innerHTML = `
                        <div class="story-image-container">
                            <img src="${storyUrl}" alt="Yeni Hikaye">
                            <div class="story-viewed-indicator"></div>
                        </div>
                    `;

                    storiesWrapper.appendChild(newStoryElement);
                } catch (error) {
                    console.error('Hikaye yükleme hatası:', error);
                    alert('Hikaye yüklenirken bir hata oluştu');
                }
            }
        });

        // Hikaye görüntüleme
        storiesWrapper.addEventListener('click', async (e) => {
            const storyItem = e.target.closest('.story-item');

            if (storyItem && !storyItem.classList.contains('add-story')) {
                const storyId = storyItem.dataset.storyId;
                this.openStoryModal(storyId);
            }
        });
    }

    static async openStoryModal(storyId) {
        const storyModal = document.getElementById('story-modal');

        try {
            // Hikaye detaylarını getir
            const story = await this.getStoryDetails(storyId);

            storyModal.innerHTML = `
                <div class="story-modal-content">
                    <div class="story-progress-bar"></div>
                    <div class="story-image-container">
                        <img src="${story.imageUrl}" alt="Hikaye">
                    </div>
                    <div class="story-user-info">
                        <img 
                            src="${story.userProfileImage}" 
                            alt="Kullanıcı Profil Resmi"
                        >
                        <span>${story.username}</span>
                        <span class="story-time">${this.formatStoryTime(
                            story.createdAt
                        )}</span>
                    </div>
                    <button class="close-story-modal">×</button>
                </div>
            `;

            storyModal.style.display = 'block';

            // Modal kapatma
            const closeModalBtn =
                storyModal.querySelector('.close-story-modal');
            closeModalBtn.addEventListener('click', () => {
                storyModal.style.display = 'none';
            });

            // Hikaye otomatik kapanma
            this.startStoryTimer(storyModal);
        } catch (error) {
            console.error('Hikaye açma hatası:', error);
        }
    }

    static async getStoryDetails(storyId) {
        // Bu metot gerçek bir servis çağrısı ile değiştirilmelidir
        return {
            id: storyId,
            imageUrl: '/example-story.jpg',
            userProfileImage: '/default-avatar.png',
            username: 'kullaniciadi',
            createdAt: new Date(),
        };
    }

    static formatStoryTime(date) {
        const now = new Date();
        const diffInMinutes = Math.round((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Az önce';
        if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;

        const diffInHours = Math.round(diffInMinutes / 60);
        return `${diffInHours} saat önce`;
    }

    static startStoryTimer(storyModal) {
        const progressBar = storyModal.querySelector('.story-progress-bar');
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                storyModal.style.display = 'none';
            } else {
                width++;
                progressBar.style.width = `${width}%`;
            }
        }, 50); // Toplam 5 saniye gösterim
    }
}
