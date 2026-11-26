# İri Oto Elektrik

Türkiye’de yerel bir oto elektrik atölyesi için kobalt + bakır kimlik taşıyan, mobil öncelikli Next.js (App Router) sitesi ve yönetim paneli.

> Varsayılan `data/seed.json` yalnızca güvenli boş iletişim alanları, brief’te onaylanmış genel hizmet metinleri ve boş iş arşivi içerir. Üretimde yalnızca işletme tarafından doğrulanmış bilgiler ve müşteri izni alınmış gerçek fotoğraflar yayımlanır.

## Öne çıkanlar

- **Public site & mimari dizilim:** porselen (`#F5F3EC`) ve derin obsidyen gece (`#080C15`) kontrast ritmi, canlı voltaj ilerleme rayına sahip yapışkan üst gezinme bandı, kobalt birincil eylemler, anodize bakır kurallar ve hassas masaüstü ölçüm imleci (`prefers-reduced-motion` uyumlu).
- **Kinetik Hero & Telemetri:** GSAP maskeli tipografi açılışı, manyetik düğme etkileşimi, canlı osiloskop telemetri kartı ve alt sistem hızlı geçiş şeridi. Onaylı atölye fotoğrafı yoksa production modunda temsili fotoğraf yerine 3-kanallı canlı teknik osiloskop ekranı gösterilir; yerel geliştirme, Vercel preview veya `DESIGN_PREVIEW=1` ortamında temsili fotoğraf açıkça etiketlenerek görünür.
- **72-Kare 3B Kesit Animasyonu (`AlternatorFrameStage`):** `npm run frames:generate` ile PBR/SSAA olarak üretilen 72 karelik alternatör & 3-faz bakır stator patlatılmış kesit dizisi (`public/sequences/alternator/frame-00.webp`..`frame-71.webp`), GSAP `ScrollTrigger` sabitleme/kaydırma, doğrudan tuval üzerinde sürükleme, zaman çubuğu ve senkronize Retina CAD çağrı çizgileriyle çalışır.
- **Canlı Şasi Röntgeni & Osiloskop Kare Simülatörü (`DiagnosticFrameLab`):** Akü/şarj, marş/alternatör, aydınlatma ve tesisat/ECU hatlarında arıza anı ile onarım sonrası kararlı akışı 60 FPS tuval üzerinde karşılaştırır.
- **Hizmetler & 4-Adım Protokol:** GSAP `ScrollTrigger` ile çizilen bakır-kobalt devre izleri, numaralı editoryal hizmet matrisi (belirti + yapılan iş + simülatör bağlantısı). Onaylı hizmet yoksa bölüm ve menü öğesi gizlenir.
- **İşler:** yalnızca kapak fotoğrafı, alt metni ve dört aşama metni eksiksiz olan yayımlanmış gerçek kayıtlar. Ana sayfada tek geniş vitrin; arşivde sade boş durum; detayda “Belirti / Teşhis / Uygulama / Sonuç”.
- **İletişim:** doğrulanmış adres, telefon, bölge, çalışma saatleri; çalışan `tel:` ve doğrudan Google Maps yol tarifi bağlantısı. Eksik eylem gizlenir, sahte bağlantı üretilmez. Harita iframe’i ilk yüklemeye alınmaz.
- **Admin:** açık gri yüzey, fotoğraf önizlemeleri, metinle yayın durumları, kobalt “Yeni iş ekle”. Taslak kaydetme, yayımlama, düzenleme, önizleme, yayından kaldırma, arşivleme, sıralama, öne çıkarma ve silme akışları korunur. Fotoğraf yüklemede boyut/tür/magic-byte doğrulaması ve sunucu tarafında oturum kontrolü vardır.
- **Görsel erişimi:** yüklemeler private Vercel Blob’a veya yerelde `data/uploads` altına yazılır; `/api/media/[name]` taslak görsellerini yalnızca yönetici oturumuna, yayımlanmış kayıtların görsellerini herkese sunar.
- **Google görünürlüğü:** sayfa bazlı canonical/OG, yalnızca Vercel production’da indeksleme, admin/önizleme için `noindex` ve `X-Robots-Tag`, yalnızca gerçek yayımlanmış işleri içeren sitemap. `AutoRepair` JSON-LD sadece sayfada görünen doğrulanmış alanlardan üretilir; puan/yorum işaretlemesi yoktur.

## Yerel kurulum

Node.js 20+ (önerilen 22 LTS) ve npm gerekir.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`.env.local` içinde en az şunları tanımlayın:

- `AUTH_SECRET`: en az 32 karakter (`openssl rand -base64 32`)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH` veya yalnızca yerel geliştirme için `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`: yerel için `http://localhost:3000`

`DATABASE_URL` tanımlı değilse `data/store.json` kullanılır; bu dosya ve `public/uploads` Git’e alınmaz. `DESIGN_PREVIEW=0` production davranışını yerelde de test etmeye yarar.

## Veritabanı ve ilk yönetici

```bash
npm run db:migrate
npm run db:seed
```

`db:seed` başlangıç işletme ayarlarını yazar; iş kaydı eklemez. `drizzle/0002_remove_examples.sql` eski dağıtımlarda kalan `is_example = true` kayıtlarını siler.

Üretimde düz metin parola yerine bcrypt hash kullanın:

```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('GUCLU-SIFRENIZ', 12));"
```

Çıkan değeri `ADMIN_PASSWORD_HASH` olarak Vercel’e ekleyin. Kayıt ekranı yoktur; `/admin/giris` tek yönetici girişidir.

## Doğrulanması gereken işletme girdileri

Canlı yayından önce `/admin/ayarlar` üzerinden şunları girin ve “Bilgiler doğrulandı” işaretleyin:

1. Onaylı işletme adı, açık adres, ilçe/mahalle ve şehir.
2. Görünen telefon ve `tel:+90…` biçiminde çalışan telefon bağlantısı.
3. Enlem/boylam veya `google.com/maps/dir/?destination=…` biçiminde doğrulanmış yol tarifi hedefi.
4. Günlük çalışma saatleri; varsa WhatsApp, e-posta ve Google İşletme Profili bağlantısı.
5. Müşteri izni alınmış, plaka/yüz içermeyen gerçek atölye hero fotoğrafı ve anlamlı alt metni; “Fotoğraf onaylandı” işareti.
6. Sunulması onaylanan hizmetler; her biri için sürücünün anlayacağı belirti ve yapılan iş.
7. Gerçek onarım kayıtları: kapak/galeri fotoğrafları, alt metin, belirti, teşhis, uygulama ve sonuç.

Eksik alanlar public arayüzde tahmin edilmez. Doğrulanmamış bilgi varsa iletişim bölümü sade boş durum gösterir ve eylem düğmeleri gizlenir.

## Komutlar

```bash
npm run typecheck
npm run lint
npm run build
```

Tasarım önizlemesi ve ekran görüntüleri için `DESIGN_PREVIEW=1 npm run dev`. Production doğrulaması için `DESIGN_PREVIEW=0` ve `VERCEL_ENV=production` ile `npm run build && npm run start`.

## Vercel dağıtımı

1. Depoyu Vercel’e bağlayın.
2. `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `NEXT_PUBLIC_SITE_URL` değerlerini production ortamına ekleyin.
3. Migration’ı çalıştırın; production’da `DESIGN_PREVIEW` tanımlamayın.
4. `/admin/giris` ile girip doğrulanmış işletme bilgilerini ve gerçek fotoğrafları yayımlayın.
5. `robots.txt`, `sitemap.xml`, canonical, OG ve JSON-LD çıktısını canlı URL üzerinden kontrol edin.

## Google yayın sonrası kontrol listesi

- Google İşletme Profili’ndeki ad, adres, telefon, kategori, çalışma/tatil saatleri ve site URL’sini siteyle birebir eşleştirin.
- Profil doğrulaması, gerçek atölye fotoğrafları ve gerçek müşteri yorumu talebi adımlarını tamamlayın.
- Search Console’da mülk doğrulayıp `sitemap.xml` gönderin; URL incelemesinde canonical ve indeks durumunu kontrol edin.
- Arama/yol tarifi tıklamaları `/api/event` ile ayrı olaylar olarak loglanır; bunlar tamamlanmış görüşme veya müşteri sayısı değildir.
- Sıralama garantisi vermeyin; yeni hizmet sayfaları için gerçek ve özgün işletme içeriği hazırlayın.

## Skill kaynakları

Tasarım, mimari ve son erişilebilirlik turunda şu kaynaklar kullanıldı: Anthropic `frontend-design` commit `41bbe19`, Vercel `react-best-practices` v1.0.0 ve Vercel `web-design-guidelines` v1.1.0. Proje özeti `.agents/skills/iri-elektrik-ui/SKILL.md` içinde tutulur.
