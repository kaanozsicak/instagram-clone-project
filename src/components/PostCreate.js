import { PostService } from '../services/post-service.js';
import { AuthService } from '../services/auth-service.js';

export class PostCreate {
    static render() {
        const postModalContainer = document.getElementById('post-create-modal');
        if (!postModalContainer) return;

        postModalContainer.innerHTML = `
            <link rel="stylesheet" href="/styles/theme.css">
            <style>
                .post-create-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .post-create-container {
                    background-color: var(--card-color);
                    border-radius: 16px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                    width: 90%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                }
                
                .post-create-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                }
                
                .post-create-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .post-create-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }
                
                .close-modal {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: var(--text-secondary);
                    cursor: pointer;
                }
                
                .post-create-body {
                    padding: 20px;
                }
                
                .upload-area {
                    border: 2px dashed var(--border-color);
                    border-radius: 8px;
                    padding: 40px 20px;
                    text-align: center;
                    margin-bottom: 20px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                
                .upload-area:hover {
                    border-color: var(--primary-color);
                    background-color: rgba(85, 99, 222, 0.05);
                }
                
                .upload-icon {
                    font-size: 48px;
                    color: var(--primary-color);
                    margin-bottom: 15px;
                }
                
                .upload-text {
                    color: var(--text-secondary);
                    margin-bottom: 15px;
                }
                
                .upload-btn {
                    background-color: var(--primary-color);
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                }
                
                #post-image-preview {
                    width: 100%;
                    max-height: 300px;
                    object-fit: contain;
                    margin: 15px 0;
                    border-radius: 8px;
                    display: none;
                }
                
                .caption-area {
                    margin-bottom: 20px;
                }
                
                .caption-area label {
                    display: block;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                    font-weight: 500;
                }
                
                .caption-area textarea {
                    width: 100%;
                    height: 100px;
                    padding: 12px 15px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    resize: none;
                    font-family: inherit;
                    font-size: 15px;
                }
                
                .caption-area textarea:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }
                
                .post-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 20px;
                }
                
                .post-submit-btn {
                    background-color: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .post-submit-btn:disabled {
                    background-color: var(--primary-light);
                    cursor: not-allowed;
                    opacity: 0.7;
                }
                
                .post-submit-btn:hover:not(:disabled) {
                    background-color: var(--primary-dark);
                }
                
                #post-error-message {
                    color: var(--error-color);
                    font-size: 14px;
                    margin: 10px 0;
                }
            </style>
            
            <div class="post-create-modal">
                <div class="post-create-container">
                    <div class="post-create-header">
                        <h3 class="post-create-title">Yeni Gönderi Oluştur</h3>
                        <button class="close-modal" id="close-post-modal">&times;</button>
                    </div>
                    
                    <div class="post-create-body">
                        <div class="upload-area" id="upload-area">
                            <div class="upload-icon">
                                <i class="fas fa-cloud-upload-alt"></i>
                            </div>
                            <p class="upload-text">Gönderi için fotoğraf yükleyin</p>
                            <button type="button" class="upload-btn">Fotoğraf Seç</button>
                            <input type="file" id="post-image-input" accept="image/*" style="display: none;">
                        </div>
                        
                        <img id="post-image-preview" src="#" alt="Önizleme">
                        
                        <div class="caption-area">
                            <label for="post-caption">Açıklama</label>
                            <textarea 
                                id="post-caption" 
                                placeholder="Gönderinize açıklama ekleyin..."
                            ></textarea>
                        </div>
                        
                        <div id="post-error-message"></div>
                        
                        <div class="post-actions">
                            <button id="post-submit-btn" class="post-submit-btn" disabled>Paylaş</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    static setupEventListeners() {
        const closeModalBtn = document.getElementById('close-post-modal');
        const uploadArea = document.getElementById('upload-area');
        const postImageInput = document.getElementById('post-image-input');
        const postImagePreview = document.getElementById('post-image-preview');
        const postSubmitBtn = document.getElementById('post-submit-btn');
        const postCaption = document.getElementById('post-caption');
        const errorMessage = document.getElementById('post-error-message');
        const modal = document.querySelector('.post-create-modal');

        let selectedImage = null;

        // Modal kapatma
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            this.resetModal();
        });

        // Modal dışına tıklama
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                this.resetModal();
            }
        });

        // Fotoğraf yükleme alanı
        uploadArea.addEventListener('click', () => {
            postImageInput.click();
        });

        // Fotoğraf seçimi ve önizleme
        postImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];

            if (file) {
                // Dosya tipi kontrolü
                if (!file.type.startsWith('image/')) {
                    errorMessage.textContent =
                        'Lütfen geçerli bir görsel dosyası seçin';
                    return;
                }

                selectedImage = file;

                // Önizleme göster
                const reader = new FileReader();
                reader.onload = function (event) {
                    postImagePreview.src = event.target.result;
                    postImagePreview.style.display = 'block';
                    uploadArea.style.display = 'none';
                    postSubmitBtn.disabled = false;
                };
                reader.readAsDataURL(file);

                errorMessage.textContent = '';
            }
        });

        // Gönderi paylaşma
        postSubmitBtn.addEventListener('click', async () => {
            if (!selectedImage) {
                errorMessage.textContent = 'Lütfen bir görsel seçin';
                return;
            }

            try {
                errorMessage.textContent = '';
                postSubmitBtn.disabled = true;
                postSubmitBtn.textContent = 'Paylaşılıyor...';

                // Gönderi yükle
                await PostService.uploadPost(selectedImage, postCaption.value);

                // Modal'ı kapat ve formu temizle
                modal.style.display = 'none';
                this.resetModal();

                // Kullanıcıya bildirim göster
                alert('Gönderiniz başarıyla paylaşıldı');

                // Sayfayı yenile veya gönderiyi dinamik olarak ekle
                window.location.reload();
            } catch (error) {
                console.error('Gönderi paylaşma hatası:', error);
                errorMessage.textContent =
                    error.message || 'Gönderi paylaşılırken bir hata oluştu';

                postSubmitBtn.disabled = false;
                postSubmitBtn.textContent = 'Paylaş';
            }
        });
    }

    static resetModal() {
        const uploadArea = document.getElementById('upload-area');
        const postImagePreview = document.getElementById('post-image-preview');
        const postCaption = document.getElementById('post-caption');
        const postSubmitBtn = document.getElementById('post-submit-btn');
        const errorMessage = document.getElementById('post-error-message');
        const postImageInput = document.getElementById('post-image-input');

        if (uploadArea) uploadArea.style.display = 'block';
        if (postImagePreview) {
            postImagePreview.style.display = 'none';
            postImagePreview.src = '#';
        }
        if (postCaption) postCaption.value = '';
        if (postSubmitBtn) {
            postSubmitBtn.disabled = true;
            postSubmitBtn.textContent = 'Paylaş';
        }
        if (errorMessage) errorMessage.textContent = '';
        if (postImageInput) postImageInput.value = '';
    }
}
