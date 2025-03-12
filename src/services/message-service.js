import { firestore } from './firebase-config.js';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    getDoc,
    doc,
    orderBy,
    serverTimestamp,
    updateDoc,
    arrayUnion,
    deleteDoc,
    limit,
    onSnapshot,
} from 'firebase/firestore';
import { AuthService } from './auth-service.js';
import { FollowService } from './follow-service.js';

export class MessageService {
    /**
     * Sohbet başlatır veya var olan sohbeti getirir
     * @param {string} recipientId - Alıcı kullanıcının ID'si
     * @returns {Promise<string>} - Sohbet ID'si
     */
    static async startConversation(recipientId) {
        try {
            console.log(
                'startConversation çağrıldı, recipientId:',
                recipientId
            );
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // recipientId kontrolü
            if (
                !recipientId ||
                recipientId === 'undefined' ||
                recipientId === 'null'
            ) {
                throw new Error('Geçersiz alıcı kimliği');
            }

            // Kullanıcı var mı kontrol et
            const recipientProfile = await AuthService.getUserProfile(
                recipientId
            );
            if (!recipientProfile) {
                throw new Error('Alıcı kullanıcı bulunamadı');
            }

            // İki kullanıcı arasındaki ilişkiyi kontrol et
            // Hata yönetimi ekleyelim
            let followStatus = { isFollowing: false, isFollower: false };
            try {
                followStatus = await FollowService.getRelationship(
                    currentUser.uid,
                    recipientId
                );
                console.log('Takip durumu:', followStatus);
            } catch (relationshipError) {
                console.error('İlişki kontrolü hatası:', relationshipError);
                // Hatayı yutuyoruz ve varsayılan değerleri kullanıyoruz
            }

            const isFollowing = followStatus.isFollowing;
            const isFollowed = followStatus.isFollower;

            // Var olan sohbeti kontrol et
            const existingChat = await this.findExistingConversation(
                currentUser.uid,
                recipientId
            );

            if (existingChat) {
                console.log('Var olan sohbet bulundu:', existingChat.id);
                return existingChat.id;
            }

            console.log('Yeni sohbet oluşturuluyor...');

            // Yeni sohbet oluştur
            const chatData = {
                participants: [currentUser.uid, recipientId],
                createdAt: serverTimestamp(),
                lastMessage: null,
                lastMessageTime: serverTimestamp(),
                // Takip durumuna göre sohbetin durumu
                status: isFollowing || isFollowed ? 'active' : 'pending',
                pendingForUser: isFollowing ? null : recipientId, // Eğer takip etmiyorsa, karşı taraf için beklemede
                unreadCount: {
                    [currentUser.uid]: 0,
                    [recipientId]: 0,
                },
            };

            console.log('Sohbet verileri:', chatData);

            const chatRef = await addDoc(
                collection(firestore, 'conversations'),
                chatData
            );

            console.log('Yeni sohbet oluşturuldu:', chatRef.id);
            return chatRef.id;
        } catch (error) {
            console.error('Sohbet başlatma hatası:', error);
            throw error;
        }
    }

    /**
     * İki kullanıcı arasında var olan sohbeti bulur
     * @param {string} userId1 - Birinci kullanıcı ID'si
     * @param {string} userId2 - İkinci kullanıcı ID'si
     * @returns {Promise<Object|null>} - Sohbet bilgileri veya null
     */
    static async findExistingConversation(userId1, userId2) {
        try {
            console.log('Var olan sohbet aranıyor:', { userId1, userId2 });

            if (!userId1 || !userId2) {
                console.error("Geçersiz kullanıcı ID'leri:", {
                    userId1,
                    userId2,
                });
                return null;
            }

            const conversationsRef = collection(firestore, 'conversations');
            const q = query(
                conversationsRef,
                where('participants', 'array-contains', userId1)
            );

            console.log('Sorgu yapılıyor...');
            const querySnapshot = await getDocs(q);
            console.log('Sorgu sonuçları:', querySnapshot.size);

            for (const doc of querySnapshot.docs) {
                const conversation = doc.data();
                console.log('Sohbet kontrolü:', {
                    id: doc.id,
                    participants: conversation.participants,
                    contains: conversation.participants.includes(userId2),
                });

                if (
                    conversation.participants &&
                    Array.isArray(conversation.participants) &&
                    conversation.participants.includes(userId2)
                ) {
                    console.log('Var olan sohbet bulundu:', doc.id);
                    return { id: doc.id, ...conversation };
                }
            }

            console.log('Eşleşen sohbet bulunamadı');
            return null;
        } catch (error) {
            console.error('Var olan sohbet kontrolü hatası:', error);
            return null;
        }
    }

    /**
     * Mesaj gönderir
     * @param {string} conversationId - Sohbet ID'si
     * @param {string} content - Mesaj içeriği
     * @param {string} type - Mesaj tipi (text, image, etc.)
     * @returns {Promise<string>} - Mesaj ID'si
     */
    static async sendMessage(conversationId, content, type = 'text') {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // Sohbet durumunu kontrol et
            const conversationRef = doc(
                firestore,
                'conversations',
                conversationId
            );
            const conversationDoc = await getDoc(conversationRef);

            if (!conversationDoc.exists()) {
                throw new Error('Sohbet bulunamadı');
            }

            const conversationData = conversationDoc.data();

            // Eğer sohbet beklemede ise ve gönderen kişi için beklemede değilse mesaj gönderilebilir
            if (
                conversationData.status === 'pending' &&
                conversationData.pendingForUser === currentUser.uid
            ) {
                throw new Error(
                    'Bu kullanıcı sizin mesaj isteğinizi henüz kabul etmedi'
                );
            }

            // Mesajı oluştur
            const messageData = {
                conversationId,
                senderId: currentUser.uid,
                content,
                type, // text, image, shared_post gibi farklı mesaj tipleri
                createdAt: serverTimestamp(),
                isRead: false,
            };

            // Mesajı ekle
            const messageRef = await addDoc(
                collection(firestore, 'messages'),
                messageData
            );

            // Son mesajı güncelle
            const recipientId = conversationData.participants.find(
                (id) => id !== currentUser.uid
            );

            // Karşı taraf için okunmamış mesaj sayısını artır
            const unreadCount = { ...conversationData.unreadCount };
            unreadCount[recipientId] = (unreadCount[recipientId] || 0) + 1;

            // Gönderi paylaşıldıysa son mesaj olarak özel bir metin göster
            let lastMessageText = content;
            if (type === 'shared_post') {
                lastMessageText = '🖼️ Bir gönderi paylaşıldı';
            }

            await updateDoc(conversationRef, {
                lastMessage: lastMessageText,
                lastMessageTime: serverTimestamp(),
                lastMessageSenderId: currentUser.uid,
                unreadCount: unreadCount,
                status: 'active', // Bir mesaj gönderildiğinde sohbet aktif duruma geçer
            });

            return messageRef.id;
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
            throw error;
        }
    }

    /**
     * Bir kullanıcının tüm sohbetlerini getirir
     * @returns {Promise<Array>} - Sohbetlerin listesi
     */
    static async getUserConversations() {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // Kullanıcının tüm sohbetlerini al
            const conversationsRef = collection(firestore, 'conversations');
            const q = query(
                conversationsRef,
                where('participants', 'array-contains', currentUser.uid),
                orderBy('lastMessageTime', 'desc')
            );

            const querySnapshot = await getDocs(q);

            const conversations = [];
            for (const doc of querySnapshot.docs) {
                const conversationData = doc.data();

                // Geçersiz verileri kontrol et
                if (
                    !conversationData ||
                    !Array.isArray(conversationData.participants) ||
                    conversationData.participants.length < 2
                ) {
                    console.warn(
                        `Geçersiz sohbet verisi: ${doc.id}`,
                        conversationData
                    );
                    continue;
                }

                const otherUserId = conversationData.participants.find(
                    (id) => id !== currentUser.uid
                );

                if (!otherUserId) {
                    console.warn(`Diğer kullanıcı bulunamadı (${doc.id})`);
                    continue;
                }

                try {
                    // Diğer kullanıcının bilgilerini getir
                    const userProfile = await AuthService.getUserProfile(
                        otherUserId
                    );

                    conversations.push({
                        id: doc.id,
                        ...conversationData,
                        otherUser: userProfile || {
                            uid: otherUserId,
                            username: 'Kullanıcı',
                            fullName: 'Bilinmeyen kullanıcı',
                            profileImage:
                                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4=',
                        },
                        isMessageRequest:
                            conversationData.status === 'pending' &&
                            conversationData.pendingForUser === currentUser.uid,
                        isSentRequest:
                            conversationData.status === 'pending' &&
                            conversationData.pendingForUser !== currentUser.uid,
                        unreadCount:
                            conversationData.unreadCount?.[currentUser.uid] ||
                            0,
                    });
                } catch (profileError) {
                    console.error(
                        `Kullanıcı profili alma hatası (${otherUserId}):`,
                        profileError
                    );

                    // Hata durumunda da sohbeti ekle
                    conversations.push({
                        id: doc.id,
                        ...conversationData,
                        otherUser: {
                            uid: otherUserId,
                            username: 'Kullanıcı',
                            fullName: 'Bilinmeyen kullanıcı',
                            profileImage:
                                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4=',
                        },
                        isMessageRequest:
                            conversationData.status === 'pending' &&
                            conversationData.pendingForUser === currentUser.uid,
                        isSentRequest:
                            conversationData.status === 'pending' &&
                            conversationData.pendingForUser !== currentUser.uid,
                        unreadCount:
                            conversationData.unreadCount?.[currentUser.uid] ||
                            0,
                    });
                }
            }

            console.log('Tüm sohbetler:', conversations);
            return conversations;
        } catch (error) {
            console.error('Sohbet listesi getirme hatası:', error);
            return [];
        }
    }

    /**
     * Bir sohbetteki tüm mesajları getirir
     * @param {string} conversationId - Sohbet ID'si
     * @returns {Promise<Array>} - Mesajların listesi
     */
    static async getMessages(conversationId) {
        try {
            const messagesRef = collection(firestore, 'messages');
            const q = query(
                messagesRef,
                where('conversationId', '==', conversationId),
                orderBy('createdAt', 'asc')
            );

            const querySnapshot = await getDocs(q);

            // Tüm mesajları okundu olarak işaretle
            this.markConversationAsRead(conversationId);

            return querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error('Mesajları getirme hatası:', error);
            return [];
        }
    }

    /**
     * Bir sohbetteki mesajları canlı olarak dinler
     * @param {string} conversationId - Sohbet ID'si
     * @param {function} callback - Her değişiklikte çağrılacak fonksiyon
     * @returns {function} - Dinlemeyi durdurmak için çağrılacak fonksiyon
     */
    static listenToMessages(conversationId, callback) {
        try {
            const messagesRef = collection(firestore, 'messages');
            const q = query(
                messagesRef,
                where('conversationId', '==', conversationId),
                orderBy('createdAt', 'asc')
            );

            // Değişiklikleri dinle
            return onSnapshot(q, (snapshot) => {
                const messages = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(messages);

                // Mesajlar geldiğinde ve aktif olarak bu sohbet görüntüleniyorsa okundu olarak işaretle
                this.markConversationAsRead(conversationId);
            });
        } catch (error) {
            console.error('Mesaj dinleme hatası:', error);
            return () => {}; // Boş bir unsubscribe fonksiyonu
        }
    }

    /**
     * Sohbetleri canlı olarak dinler
     * @param {function} callback - Her değişiklikte çağrılacak fonksiyon
     * @returns {function} - Dinlemeyi durdurmak için çağrılacak fonksiyon
     */
    static listenToConversations(callback) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                console.error('Kullanıcı oturumu açık değil');
                return () => {}; // Boş bir unsubscribe fonksiyonu dön
            }

            const conversationsRef = collection(firestore, 'conversations');
            const q = query(
                conversationsRef,
                where('participants', 'array-contains', currentUser.uid),
                orderBy('lastMessageTime', 'desc')
            );

            return onSnapshot(q, async (snapshot) => {
                try {
                    const conversations = [];
                    const invalidConversations = [];

                    for (const doc of snapshot.docs) {
                        const conversationData = doc.data();

                        // Detaylı loglamalar ekleyelim
                        console.log(`Sohbet ID: ${doc.id}`);
                        console.log(`Sohbet verileri:`, conversationData);
                        console.log(`CurrentUser UID:`, currentUser.uid);

                        // Geçersiz verileri daha sıkı kontrol et
                        if (
                            !conversationData ||
                            !Array.isArray(conversationData.participants)
                        ) {
                            console.warn(
                                `Geçersiz sohbet verisi: ${doc.id}`,
                                conversationData
                            );
                            invalidConversations.push(doc.id);
                            continue;
                        }

                        // Katılımcılar listesini kontrol et
                        console.log(
                            `Katılımcılar:`,
                            conversationData.participants
                        );

                        // "undefined" string değerini kontrol et
                        if (
                            conversationData.participants.includes(
                                'undefined'
                            ) ||
                            conversationData.participants.includes(undefined) ||
                            conversationData.participants.includes(null)
                        ) {
                            console.warn(
                                `Geçersiz katılımcı değeri (${
                                    doc.id
                                }): ${JSON.stringify(
                                    conversationData.participants
                                )}`
                            );
                            invalidConversations.push(doc.id);

                            // Otomatik silme işlemi - kullanıcı deneyimini iyileştirmek için
                            try {
                                await deleteDoc(doc.ref);
                                console.log(
                                    `Bozuk sohbet otomatik silindi: ${doc.id}`
                                );
                            } catch (deleteError) {
                                console.error(
                                    `Sohbet silinirken hata (${doc.id}):`,
                                    deleteError
                                );
                            }
                            continue;
                        }

                        // 2'den az katılımcı olması durumunu kontrol et
                        if (conversationData.participants.length < 2) {
                            console.warn(
                                `Eksik katılımcı sayısı (${doc.id}): ${conversationData.participants.length}`
                            );
                            invalidConversations.push(doc.id);

                            // Bu sohbeti kullanıcı arayüzünde göstermeye gerek yok, otomatik sil
                            try {
                                await deleteDoc(doc.ref);
                                console.log(
                                    `Eksik katılımcılı sohbet otomatik silindi: ${doc.id}`
                                );
                            } catch (deleteError) {
                                console.error(
                                    `Sohbet silinirken hata (${doc.id}):`,
                                    deleteError
                                );
                            }

                            continue;
                        }

                        // Şimdi diğer kullanıcıyı bulalım
                        const otherUserId = conversationData.participants.find(
                            (uid) =>
                                uid !== currentUser.uid &&
                                uid !== 'undefined' &&
                                uid !== undefined &&
                                uid !== null
                        );

                        if (!otherUserId) {
                            console.error(
                                `Diğer kullanıcı bulunamadı (${doc.id}). Katılımcılar:`,
                                conversationData.participants
                            );
                            invalidConversations.push(doc.id);
                            continue;
                        }

                        console.log(
                            `Diğer kullanıcı ID: ${otherUserId} bulundu`
                        );

                        // Kullanıcı profil bilgilerini al
                        let userProfile = null;
                        try {
                            userProfile = await AuthService.getUserProfile(
                                otherUserId
                            );
                            console.log(
                                `${otherUserId} kullanıcı profili:`,
                                userProfile
                            );
                        } catch (profileError) {
                            console.error(
                                `Kullanıcı profili alma hatası (${otherUserId}):`,
                                profileError
                            );
                        }

                        // Profil varsa veya yoksa varsayılan verilerle sohbeti ekle
                        const userToShow = userProfile || {
                            uid: otherUserId,
                            username: `Kullanıcı_${otherUserId.substring(
                                0,
                                5
                            )}`,
                            fullName: `Kullanıcı ID: ${otherUserId.substring(
                                0,
                                8
                            )}`,
                            profileImage:
                                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2IzYjNiMyIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwaDEyMHoiIGZpbGw9IiNiM2IzYjMiLz48L3N2Zz4=',
                        };

                        console.log(
                            `Sohbet ${doc.id} için gösterilecek kullanıcı:`,
                            userToShow
                        );

                        conversations.push({
                            id: doc.id,
                            ...conversationData,
                            otherUser: userToShow,
                            isMessageRequest:
                                conversationData.status === 'pending' &&
                                conversationData.pendingForUser ===
                                    currentUser.uid,
                            isSentRequest:
                                conversationData.status === 'pending' &&
                                conversationData.pendingForUser !==
                                    currentUser.uid,
                            unreadCount:
                                conversationData.unreadCount?.[
                                    currentUser.uid
                                ] || 0,
                        });
                    }

                    // Eğer geçersiz sohbetler bulunursa konsola bilgi yazdır
                    if (invalidConversations.length > 0) {
                        console.warn(
                            `Toplam ${invalidConversations.length} geçersiz sohbet bulundu ve atlandı:`,
                            invalidConversations
                        );
                    }

                    // Hata ayıklama: Oluşturulmuş conversation listesini logla
                    console.log('İşlenmiş sohbetler:', conversations);

                    callback(conversations);
                } catch (error) {
                    console.error('Sohbet verilerini işleme hatası:', error);
                    callback([]);
                }
            });
        } catch (error) {
            console.error('Sohbet dinleme hatası:', error);
            return () => {}; // Boş bir unsubscribe fonksiyonu
        }
    }

    /**
     * Sohbeti okundu olarak işaretler
     * @param {string} conversationId - Sohbet ID'si
     * @returns {Promise<boolean>} - İşlem başarılı mı
     */
    static async markConversationAsRead(conversationId) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                return false;
            }

            const conversationRef = doc(
                firestore,
                'conversations',
                conversationId
            );
            const conversationDoc = await getDoc(conversationRef);

            if (!conversationDoc.exists()) {
                return false;
            }

            const conversationData = conversationDoc.data();
            const unreadCount = { ...conversationData.unreadCount };

            // Mevcut kullanıcı için okunmamış mesaj sayısını sıfırla
            if (unreadCount[currentUser.uid] > 0) {
                unreadCount[currentUser.uid] = 0;

                await updateDoc(conversationRef, {
                    unreadCount,
                });
            }

            return true;
        } catch (error) {
            console.error('Okundu olarak işaretleme hatası:', error);
            return false;
        }
    }

    /**
     * Mesaj isteğini kabul eder
     * @param {string} conversationId - Sohbet ID'si
     * @returns {Promise<boolean>} - İşlem başarılı mı
     */
    static async acceptMessageRequest(conversationId) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            const conversationRef = doc(
                firestore,
                'conversations',
                conversationId
            );
            const conversationDoc = await getDoc(conversationRef);

            if (!conversationDoc.exists()) {
                throw new Error('Sohbet bulunamadı');
            }

            const conversationData = conversationDoc.data();

            // Sadece benim için beklemede ise kabul edebilirim
            if (
                conversationData.status === 'pending' &&
                conversationData.pendingForUser === currentUser.uid
            ) {
                await updateDoc(conversationRef, {
                    status: 'active',
                    pendingForUser: null,
                });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Mesaj isteği kabul hatası:', error);
            throw error;
        }
    }

    /**
     * Mesaj isteğini reddeder
     * @param {string} conversationId - Sohbet ID'si
     * @returns {Promise<boolean>} - İşlem başarılı mı
     */
    static async rejectMessageRequest(conversationId) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // Sohbeti ve ilgili tüm mesajları sil
            await this.deleteConversation(conversationId);
            return true;
        } catch (error) {
            console.error('Mesaj isteği reddetme hatası:', error);
            throw error;
        }
    }

    /**
     * Sohbeti ve ilgili tüm mesajları siler
     * @param {string} conversationId - Sohbet ID'si
     * @returns {Promise<boolean>} - İşlem başarılı mı
     */
    static async deleteConversation(conversationId) {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Kullanıcı oturumu açık değil');
            }

            // İlgili tüm mesajları sil
            const messagesRef = collection(firestore, 'messages');
            const q = query(
                messagesRef,
                where('conversationId', '==', conversationId)
            );

            const querySnapshot = await getDocs(q);

            const deletePromises = querySnapshot.docs.map((doc) => {
                return deleteDoc(doc.ref);
            });

            await Promise.all(deletePromises);

            // Sohbeti sil
            const conversationRef = doc(
                firestore,
                'conversations',
                conversationId
            );
            await deleteDoc(conversationRef);

            return true;
        } catch (error) {
            console.error('Sohbet silme hatası:', error);
            throw error;
        }
    }

    /**
     * Toplam okunmamış mesaj sayısını getirir
     * @returns {Promise<number>} - Okunmamış mesaj sayısı
     */
    static async getUnreadMessagesCount() {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                return 0;
            }

            const conversations = await this.getUserConversations();

            let unreadCount = 0;
            for (const conversation of conversations) {
                unreadCount += conversation.unreadCount || 0;
            }

            return unreadCount;
        } catch (error) {
            console.error('Okunmamış mesaj sayısı hatası:', error);
            return 0;
        }
    }

    static renderMessages(messages) {
        // ...existing code...

        // Paylaşılan gönderi mesajlarını işle
        if (message.type === 'shared_post') {
            try {
                const sharedPost = JSON.parse(message.content);
                // Paylaşılan gönderinin HTML'ini oluştur - daha kompakt ve tıklanabilir
                return `
                <div class="message-bubble ${messageClass}">
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
                                              sharedPost.postCaption.length > 30
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
                    <div class="message-time">${timestamp}</div>
                </div>
                `;
            } catch (error) {
                console.error('Paylaşılan gönderi ayrıştırma hatası:', error);
                return `
                <div class="message-bubble ${messageClass}">
                    <div class="shared-post-error">Gönderi yüklenemedi</div>
                    <div class="message-time">${timestamp}</div>
                </div>
                `;
            }
        }

        // ...existing code...
    }
}

export default MessageService;
