import { firestore } from './firebase-config.js';
import { doc, getDoc } from 'firebase/firestore';
import { PostService } from './post-service.js';
import { MessageService } from './message-service.js';
import { FollowService } from './follow-service.js';
import { ProfileService } from './profile-service.js';
import { AuthService } from './auth-service.js';

export class ShareService {
    /**
     * Gönderiyi mesaj olarak paylaş
     * @param {string} postId - Paylaşılacak gönderinin ID'si
     * @param {string} recipientId - Gönderinin paylaşılacağı kullanıcının ID'si
     * @returns {Promise<Object>} - Paylaşım sonucu
     */
    static async sharePostAsMessage(postId, recipientId) {
        try {
            // Mevcut kullanıcıyı kontrol et
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // Gönderiyi al
            const post = await PostService.getPostById(postId);
            if (!post) {
                throw new Error('Gönderi bulunamadı');
            }

            // Gönderinin sahibinin gizlilik ayarlarını kontrol et
            const isPrivate = await ProfileService.getPrivacySettings(
                post.userId
            );

            // Eğer gönderi sahibinin hesabı gizli ise ve alıcı kullanıcı bu hesabı takip etmiyorsa paylaşıma izin verme
            if (isPrivate) {
                // Alıcı kullanıcının takip ettiği kişileri al
                const followingList = await FollowService.getFollowing(
                    recipientId
                );

                // Eğer alıcı kullanıcı gönderi sahibini takip etmiyorsa ve kendisi değilse hata döndür
                if (
                    !followingList.includes(post.userId) &&
                    recipientId !== post.userId
                ) {
                    throw new Error(
                        'Bu gönderi gizli bir hesaba ait ve alıcı kullanıcı bu hesabı takip etmiyor'
                    );
                }
            }

            // Sohbeti başlat veya var olan sohbeti getir
            const conversationId = await MessageService.startConversation(
                recipientId
            );

            // Gönderinin paylaşım içeriğini hazırla - özel bir format oluştur
            const shareContent = JSON.stringify({
                type: 'shared_post',
                postId: postId,
                postOwnerId: post.userId,
                postOwnerUsername: post.username,
                postImageUrl: post.imageUrl,
                postCaption: post.caption || '',
                sharedBy: currentUser.uid,
                sharedAt: new Date(),
            });

            // Mesaj olarak gönder (özel bir mesaj tipi olarak)
            await MessageService.sendMessage(
                conversationId,
                shareContent,
                'shared_post'
            );

            return {
                success: true,
                conversationId,
                message: 'Gönderi başarıyla paylaşıldı',
            };
        } catch (error) {
            console.error('Gönderi paylaşım hatası:', error);
            throw error;
        }
    }
}

export default ShareService;
