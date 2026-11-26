# İşletme sahibinin kontrol listesi

Gerçek bilgiler girilene kadar iletişim ve akü listesi boş kalır. Telefon ve WhatsApp düğmeleri yalnızca `/admin/ayarlar` içinde bilgiler doğrulandıktan ve bağlantılar güvenlik denetiminden geçtikten sonra görünür. Boş veya örnek numaraları kaydetmeyin.

- [ ] [SAHİP DOLDURACAK: açık adres]
- [ ] [SAHİP DOLDURACAK: ilçe / mahalle]
- [ ] [SAHİP DOLDURACAK: şehir]
- [ ] [SAHİP DOLDURACAK: ülke / hizmet bölgesi] — yalnızca doğrulanmış bilgi; mevcut panelde ayrı bölge alanı yoktur.
- [ ] [SAHİP DOLDURACAK: telefon, görünen yazım ve tel:+… bağlantısı]
- [ ] [SAHİP DOLDURACAK: WhatsApp bağlantısı, https://wa.me/…]
- [ ] [SAHİP DOLDURACAK: e-posta]
- [ ] [SAHİP DOLDURACAK: çalışma saatleri, gün gün]
- [ ] [SAHİP DOLDURACAK: Google Haritalar yol tarifi URL veya enlem/boylam]
- [ ] [SAHİP DOLDURACAK: Google İşletme Profili URL]
- [ ] [SAHİP DOLDURACAK: onaylı hero ve hizmet fotoğrafları + alt metin; plaka ve yüz yok]
- [ ] [SAHİP DOLDURACAK: akü seçici gerçek araç/akü satırları]

## Fotoğraflar ve içerik

Hero için yatay 16:9 ve mobil 4:5; akü, tesisat, hoparlör için 3:2; teyp ve banko için 16:9 kareler hazırlayın. Lamba karşılaştırması aynı araç, kamera ve kadrajla çekilmiş iki 16:9 fotoğraf gerektirir. Müşteri izni alın; plakaları, yüzleri ve izinsiz marka işaretlerini kaldırın. Türkçe alt metin ekleyin.

`public/design-preview/` içindeki yeni görseller yapay zekâ ile üretilmiş temsili tasarım kareleridir; gerçek atölye veya yapılmış iş belgesi değildir. Önizleme kapalı üretimde gösterilmez. Arşive eklemeyin.

Hero ve hizmet fotoğrafları, hizmet metinleri, onayları ve isteğe bağlı ikinci hero satırı `/admin/ayarlar` içinden düzenlenebilir. İkinci satır varsayılan olarak kapalıdır. Yeni teyp/multimedya ve ses hizmetlerinin kapsamını kontrol edin.

Akü satırları şimdilik `data/battery-finder.ts` içindeki tipli boş diziden yönetilir; gerçek kayıtlar `source: "owner"` olmalıdır. Panelde akü veri düzenleyicisi henüz yoktur. Lamba çifti de şu an `lib/content.ts` üzerinden bağlanır; panelde çift fotoğraf alanı henüz yoktur. Genel bölüm/UI metinleri `data/landing-content.ts` içinde merkezîdir; tamamı panelden düzenlenebilir değildir.

Yapılan işler arşivi boş bırakılmıştır. Yalnızca izinli, eksiksiz gerçek kayıtları yayımlayın. Gerçek bilgiler olmadan şehir, hizmet bölgesi, stok, fiyat, garanti, değerlendirme veya müşteri iddiası eklemeyin.

## Teknik doğrulama

```sh
npm ci
npm run typecheck
npm run lint
npm run build
npm start -- --hostname 0.0.0.0
```

Bu ortamda üç kontrol de geçti. Ana sayfa ilk yükleme JS: Next build raporunda 117 kB. Lighthouse veya tarayıcı ölçümü yapılmadı; puan iddiası yoktur. Hedefler: tüm kategoriler ≥90; LCP ≤2,5 sn, CLS ≤0,1, INP ≤200 ms.

Tarayıcı bulunan ortamda üretim sunucusuna karşı Lighthouse çalıştırın: `npx lighthouse http://localhost:3000 --output=html --output-path=/tmp/iri-lighthouse.html`; masaüstü için `--preset=desktop` ekleyin. 390/768/1440 genişlikte menü, slider (oklar/Home/End), seçiciler, ses başlat/durdur, azaltılmış hareket, sekme görünürlüğü ve mobil güvenli alan/klavye kontrollerini tamamlayın.

### Bilinen uygulama farkı

Google font sunucularına erişim bu ortamda engelli olduğundan `next/font/google` yerine aynı üç fontun yerel Fontsource paketleri kullanılıyor (Latin ve Latin-Ext). Bu, istenen font yükleme yönteminden bir sapmadır; harici font isteği olmadan üretim derlemesini mümkün kılar.

Üretime dağıtım veya birleştirme yapılmadı.
