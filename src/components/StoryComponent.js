import { AuthService } from '../services/auth-service.js';
import { StoryService } from '../services/story-service.js';

export class StoryComponent {
    static async render() {
        const storiesContainer = document.getElementById('stories-container');
        const user = await AuthService.getCurrentUser();

        // Kullanıcının ve takip ettiği kullanıcıların hikayelerini getir
        const userStories = await StoryService.fetchUserStories(user.uid);

        storiesContainer.innerHTML = `
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

                ${userStories.map(story => `
                    <div class="story-item" data-story-id="${story.id}">
                        <div class="story-image-container">
                            <img src="${story.imageUrl}" alt="Hikaye">
                            <div class="story-viewed-indicator"></div>
                        </div>
                    </div>
                `).join('')}
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
                        <span class="story-time">${this.formatStoryTime(story.createdAt)}</span>
                    </div>
                    <button class="close-story-modal">×</button>
                </div>
            `;

            storyModal.style.display = 'block';

            // Modal kapatma
            const closeModalBtn = storyModal.querySelector('.close-story-modal');
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
            createdAt: new Date()
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