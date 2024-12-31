import { PostService } from '../services/post-service.js';
import { AuthService } from '../services/auth-service.js';

export class PostCreate {
    static render() {
        const postModalContainer = document.getElementById('post-create-modal');
        postModalContainer.innerHTML = `
            <div class="modal-content post-create-modal">
                <div class="modal-header">
                    <h2>Yeni Gönderi Oluştur</h2>
                    <button id="close-post-modal">×</button>
                </div>
                <div class="post-create-content">
                    <div class="image-preview-container">
                        <img id="image-preview" src="" alt="Önizleme">
                        <input 
                            type="file" 
                            id="post-image-input" 
                            accept="image/*" 
                            style="display:none;"
                        >
                        <button id="select-image-btn">Fotoğraf Seç</button>
                    </div>
                    <div class="post-caption-container">
                        <textarea 
                            id="post-caption" 
                            placeholder="Açıklama ekle..." 
                            rows="4"
                        ></textarea>
                        <button id="share-post-btn">Paylaş</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    static setupEventListeners() {
        const postModal = document.getElementById('post-create-modal');
        const closeModalBtn = document.getElementById('close-post-modal');
        const selectImageBtn = document.getElementById('select-image-btn');
        const imageInput = document.getElementById('post-image-input');
        const imagePreview = document.getElementById('image-preview');
        const sharePostBtn = document.getElementById('share-post-btn');
        const captionInput = document.getElementById('post-caption');

        // Modal kapatma
        closeModalBtn.addEventListener('click', () => {
            postModal.style.display = 'none';
            this.resetModal();
        });

        // Resim seçme
        selectImageBtn.addEventListener('click', () => {
            imageInput.click();
        });

        // Resim önizleme
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagePreview.src = event.target.result;
                    imagePreview.style.display = 'block';
                    selectImageBtn.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        // Gönderi paylaşma
        sharePostBtn.addEventListener('click', async () => {
            const imageFile = imageInput.files[0];
            const caption = captionInput.value;

            if (!imageFile) {
                alert('Lütfen bir resim seçin');
                return;
            }

            try {
                const user = await AuthService.getCurrentUser();
                if (user) {
                    await PostService.createPost(imageFile, caption);
                    
                    // Başarılı paylaşım
                    alert('Gönderi paylaşıldı!');
                    
                    // Modalı kapat
                    postModal.style.display = 'none';
                    this.resetModal();
                } else {
                    alert('Lütfen önce giriş yapın');
                }
            } catch (error) {
                console.error('Gönderi paylaşma hatası:', error);
                alert('Gönderi paylaşılırken bir hata oluştu');
            }
        });
    }

    static resetModal() {
        const imagePreview = document.getElementById('image-preview');
        const imageInput = document.getElementById('post-image-input');
        const captionInput = document.getElementById('post-caption');
        const selectImageBtn = document.getElementById('select-image-btn');

        imagePreview.src = '';
        imagePreview.style.display = 'none';
        imageInput.value = '';
        captionInput.value = '';
        selectImageBtn.style.display = 'block';
    }
}