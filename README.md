# 📸 Photogram - Instagram Clone

Modern ve kullanıcı dostu bir sosyal medya uygulaması. Firebase tabanlı bu Instagram klonu, temel sosyal medya özelliklerini içerir.

## 🌟 Özellikler

-   🔐 Kullanıcı kimlik doğrulama (email/şifre, Google ve Facebook ile giriş)
-   👤 Kullanıcı profilleri (özelleştirilebilir profil fotoğrafı, biyografi)
-   📝 Gönderiler (fotoğraf paylaşımı ve açıklama ekleme)
-   ❤️ Gönderileri beğenme ve yorum yapma
-   🔍 Kullanıcı arama
-   👥 Kullanıcıları takip etme
-   🔒 Gizli profil özelliği (takipçiler dışındakilere kapalı)
-   📱 Mobil uyumlu tasarım

## 🚀 Teknolojiler

-   JavaScript (ES6+)
-   Firebase (Authentication, Firestore, Storage)
-   HTML5 ve CSS3
-   Vanilla JS (Framework kullanılmadı)

## 🛠️ Kurulum

1. Repo'yu klonlayın

```bash
git clone https://github.com/kullaniciadi/instagram-clone.git
cd instagram-clone
```

2. Firebase projenizi oluşturun ve yapılandırma dosyanızı ekleyin:

    - [Firebase Console](https://console.firebase.google.com/)'a gidin
    - Yeni bir proje oluşturun
    - Authentication, Firestore ve Storage servislerini etkinleştirin
    - Proje ayarlarından web uygulaması ekleyin
    - Firebase yapılandırma bilgilerini `src/services/firebase-config.js` dosyasına ekleyin

3. Gerekli paketleri yükleyin:

```bash
npm install
```

4. Uygulamayı başlatın:

```bash
npm start
```

## 📄 Proje Yapısı

📁 src/

┣ 📁 components/ # UI bileşenleri

┣ 📁 pages/ # Ana sayfa bileşenleri

┣ 📁 services/ # Firebase ve diğer servisler

┣ 📁 styles/ # CSS dosyaları

┗ 📄 app.js # Ana uygulama

📁 public/ # Statik dosyalar

⚡ Performans İyileştirmeleri

-   Sonsuz kaydırma ile gönderi yükleme
-   Görüntü lazy-loading
-   Firebase sınırlı sorgulama

🔮 Gelecek Özellikler

-   Hikaye özelliği
-   Direkt mesaj (DM)
-   Bildirimler
-   Keşfet sayfası
-   Hashtag ve konum etiketleme

🤝 Katkıda Bulunma
Katkılarınızı bekliyoruz! Lütfen:

-   Bu repo'yu forklayın
-   Yeni bir özellik dalı oluşturun (git checkout -b yeni-ozellik)
-   Değişikliklerinizi commit edin (git commit -m 'Yeni özellik eklendi')
-   Dalınızı push edin (git push origin yeni-ozellik)
-   Pull Request açın

📝 Lisans
MIT
