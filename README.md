# İri Oto Elektrik

Türkiye’de yerel bir oto elektrik atölyesi için hazırlanmış, mobil öncelikli, editöryel Next.js (App Router) web uygulaması ve sade yönetim paneli.

> **Önemli:** Varsayılan `data/seed.json` içindeki işletme bilgileri (ad, ilçe/şehir, adres, telefon, çalışma saatleri, örnek işler) **doğrulanmamış örnek veridir**. Üretimde yalnızca doğrulanmış işletme bilgileri ve müşteri izni alınmış gerçek onarım fotoğrafları yayımlanmalıdır.

---

## Özellikler

- **Kamusal site:**
  - Tek ekranda net değer önerisi (“Aracın elektriğini çözüyoruz.”), doğrulanmış bölge ve gerçek atölye görseli alanı
  - Mobilde alt sabit **Ara / Yol tarifi** çubuğu (içeriği ve klavye odağını kapatmaz, `safe-area-inset-bottom` destekli)
  - Editöryel hizmet listesi (yalnızca onaylı hizmetler yayımlanır; her biri belirti + sunulan hizmet olarak yazılır)
  - **Yapılan işler** vitrini, kategori filtreli arşiv (`/yapilan-isler`) ve **Belirti / Teşhis / Uygulama / Sonuç** yapılı detay sayfaları (`/yapilan-isler/[slug]`)
  - Doğrulanmamış/eksik işletme verisinde üretimde tahmini bilgi, sahte yorum veya boş bağlantı gösterilmez; saat verisi yoksa açık/kapalı etiketi üretilmez
- **Yönetim paneli (`/admin`):**
  - Tek yönetici girişi (`/admin/giris`), kayıt ekranı yok
  - İş ekleme, düzenleme, sıralama, öne çıkarma, taslak/yayımla/yayından kaldır/arşivle, silme ve oturum korumalı taslak önizleme (`/admin/onizleme/[id]`)
  - Yayımlanan slug sabit tutulur; değiştirilirse eski adresten otomatik 308 yönlendirme yapılır
  - Sunucu taraflı dosya yükleme doğrulaması (`/api/upload`: boyut, uzantı ve magic-byte kontrolü; Vercel Blob veya yerel `public/uploads`)
  - Tek kaynaklı işletme ayarları (`/admin/ayarlar`)
  - Yayımlama/güncelleme sonrası ana sayfa, arşiv, detay ve `sitemap.xml` otomatik yenilenir (`revalidatePath`)
- **SEO ve ölçüm:**
  - Sayfa bazlı `title`, `description`, `canonical`, Open Graph
  - Yalnızca üretimde indekslenebilir `sitemap.xml` ve `robots.txt` (admin/önizleme/taslaklar hariç)
  - `AutoRepair` JSON-LD yalnızca işletme bilgileri `Doğrulandı` olarak işaretlendiğinde eklenir; sahte puan/yorum yok
  - Arama, yol tarifi ve WhatsApp tıklamaları ayrı olaylar olarak `/api/event` üzerinden kaydedilir

---

## Yerel Kurulum

Gereksinimler: **Node.js 20+** (önerilen 22 LTS) ve **npm**.

```bash
npm install
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:

- `AUTH_SECRET`: En az 32 karakterlik rastgele gizli anahtar (`openssl rand -base64 32`)
- `ADMIN_EMAIL`: Yönetici e-posta adresi
- `ADMIN_PASSWORD_HASH` veya (yalnızca yerel geliştirme için) `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`: Yerel için `http://localhost:3000`, üretim için alan adınız (`https://...`)
- `DATABASE_URL` (isteğe bağlı): Tanımlı değilse yerel geliştirmede `data/store.json` kullanılır
- `BLOB_READ_WRITE_TOKEN` (isteğe bağlı): Tanımlı değilse yüklenen görseller `public/uploads/` altına yazılır

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

---

## Veritabanı (PostgreSQL / Neon) ve Migrasyon

1. Neon veya herhangi bir PostgreSQL veritabanı oluşturup bağlantı dizesini `DATABASE_URL` olarak ayarlayın.
2. Migrasyonu çalıştırın:
   ```bash
   npm run db:migrate
   ```
3. (İsteğe bağlı) Başlangıç örnek verisini yükleyin:
   ```bash
   npm run db:seed
   ```

---

## Güvenli İlk Yönetici Kurulumu

Üretimde düz metin `ADMIN_PASSWORD` yerine **bcrypt hash** (`ADMIN_PASSWORD_HASH`) kullanın:

```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('GUCLU-SIFRENIZ', 12));"
```

Çıkan hash’i `ADMIN_PASSWORD_HASH` ortam değişkenine yazın. `AUTH_SECRET` değerini `openssl rand -base64 32` ile üretin.

---

## Kalite Kontrolleri

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Vercel Dağıtımı

1. Depoyu Vercel’e bağlayın.
2. **Environment Variables** bölümüne `.env.example` içindeki değişkenleri ekleyin:
   - `DATABASE_URL` (Neon Postgres)
   - `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
   - `AUTH_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH`
   - `NEXT_PUBLIC_SITE_URL` (üretim alan adı, örn. `https://iriotoelektrik.com`)
3. İlk dağıtımdan sonra `npm run db:migrate` komutunu veritabanına karşı çalıştırın.
4. `/admin/giris` üzerinden giriş yapıp **İşletme ayarları** sayfasından doğrulanmış işletme bilgilerini girin ve **Bilgiler doğrulandı** kutusunu işaretleyin.

---

## Google İşletme Profili ve Search Console Kontrol Listesi

- **Google İşletme Profili:**
  - İşletme adı, adres, telefon ve çalışma saatleri sitedeki **İşletme ayarları** ile birebir aynı olmalıdır.
  - Doğrulanmış Google İşletme Profili bağlantısını `profileUrl` alanına ekleyin.
  - Sıralama garantisi verilmez; tutarlı ve doğru bilgi temel gerekliliktir.
- **Google Search Console:**
  1. Alan adını Search Console’da doğrulayın.
  2. Üretim yayını sonrası `https://ALAN_ADINIZ/sitemap.xml` adresini gönderin.
  3. `/admin` ve `/admin/onizleme/*` yollarının dizine eklenmediğini doğrulayın.

---

## Doğrulanması Gereken İşletme Girdileri

Üretime geçmeden önce işletme sahibinden şu bilgilerin netleştirilmesi gerekir:

1. Kesin işletme adı
2. İlçe, şehir ve açık adres
3. Harita koordinatları (enlem / boylam) ve Google Haritalar bağlantısı
4. Telefon numarası (ve varsa WhatsApp hattı)
5. Günlük çalışma saatleri
6. Sunulan ve müşteriye açıkça duyurulması onaylanan hizmetler
7. Gerçek atölye ve onarım fotoğrafları (müşteri izni alınmış, plaka/yüz gizlenmiş, anlamlı alt metinli)
