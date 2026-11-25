# Teslim notu — İri Oto Elektrik public site yeniden tasarımı

Tarih: 25 Kasım 2026 · Branch: `arena/3a50e056-irielektrik` · Canlı referans: `https://iri-elektrik.vercel.app/`

## Özet

Public katman baştan yazıldı: şematik kaput SVG’si, dalgalı kablo ayırıcıları, petrol/lime paleti, örnek onarım kayıtları, “Örnek Mahalle / Örnek veri / fotoğraf eklenecek” metinleri ve soluk disabled CTA’lar kaldırıldı. Yerine porselen zemin, gece mavisi nav/iletişim, kobalt birincil eylem, bakır kısa kurallar, Barlow Condensed + Instrument Sans tipografi, kenara uzanan geniş atölye fotoğrafı (yalnızca tasarım önizlemesinde temsili), ince çizgili hizmet listesi ve gece mavisi iletişim bandı geldi.

Üretimde onaylı gerçek fotoğraf yoksa fotoğraf hiç gösterilmez; kompakt tipografik hero ve hemen ardından hizmetler render edilir. Telefon, adres, bölge, saatler ve yol tarifi yalnızca `business.verified` ve doğrulanmış alanlar varsa görünür. Eksik eylem gizlenir, sahte bağlantı üretilmez. Örnek/taslak/eksiksiz olmayan işler public liste, detay, ana sayfa ve sitemap’ten çıkarılır.

## Tarayıcıda görünen sonuç ve müşteriye hazırlık kararı

**Karar: Kod ve tasarım önizlemesi tamam; müşteriye açılacak canlı site olarak hazır değil.**

Gerçek Chromium ile görülen temiz production durumunda:

- Doğrulanmış telefon/adres/saat olmadığı için `Hemen ara` ve `Yol tarifi` düğmeleri yok; iletişim bandında sade boş durum yazısı var. Bu, brief’in “yalnızca doğrulanmış veri varsa” kuralının doğru çalıştığı anlamına gelir; fakat Google’dan gelen sürücü için birincil işletme eylemi henüz yoktur.
- Onaylı gerçek atölye fotoğrafı olmadığı için production kompakt tipografik hero gösteriyor. Tasarım önizlemesindeki temsili fotoğraf açıkça etiketlidir ve production’a sızmıyor.
- Gerçek yayımlanmış onarım kaydı olmadığı için ana sayfadaki iş vitrini gizli, arşiv sade boş durum gösteriyor.
- Vercel bağlantısı üzerinden erişilebilen bir proje/dağıtım bulunamadığı için bu değişiklikler canlı `iri-elektrik.vercel.app` adresine dağıtılmadı; canlı production doğrulaması yapılamadı. Yerel `next start` production modu ve gerçek tarayıcı kontrolleri yapıldı.

Bu nedenle site şu an **güvenli bir tasarım/code teslimi** olarak değerlendirilmelidir; telefon, adres, çalışma saatleri, onaylı gerçek fotoğraf, gerçek iş kayıtları ve production ortamı girilmeden müşteriye açılmamalıdır.

## Değiştirilen dosyalar

`git status --short` özeti (48 izlenen dosyada `4141 insertions(+), 1584 deletions(-)`, 7 silme, 10 yeni kök/dizin):

```text
 M .agents/skills/iri-elektrik-ui/SKILL.md
 M .env.example
 M .gitignore
 M README.md
 M app/admin/actions.ts
 M app/admin/ayarlar/page.tsx
 M app/admin/giris/page.tsx
 M app/admin/isler/[id]/page.tsx
 M app/admin/isler/yeni/page.tsx
 M app/admin/layout.tsx
 M app/admin/onizleme/[id]/page.tsx
 M app/admin/page.tsx
 M app/api/upload/route.ts
 M app/globals.css
 M app/layout.tsx
 M app/not-found.tsx
 M app/page.tsx
 M app/robots.ts
 M app/sitemap.ts
 M app/yapilan-isler/[slug]/page.tsx
 M app/yapilan-isler/page.tsx
 D components/CableDivider.tsx
 D components/ExampleBadge.tsx
 M components/JobCard.tsx
 D components/MobileCtaBar.tsx
 M components/SiteHeader.tsx
 D components/TrackLink.tsx
 M components/admin/ConfirmButton.tsx
 M components/admin/JobForm.tsx
 M components/admin/LogoutButton.tsx
 M components/admin/SettingsForm.tsx
 M components/admin/Toast.tsx
 M data/seed.json
 M eslint.config.mjs
 M lib/seo.ts
 M lib/store.ts
 M lib/types.ts
 M lib/validation.ts
 M middleware.ts
 M next.config.ts
 M package.json
 M prompt.md
 M public/favicon.svg
 D public/hero-atolye.svg
 D public/placeholder-is.svg
 M scripts/seed.ts
 M tsconfig.json
 D tsconfig.tsbuildinfo
?? app/api/media/
?? components/PublicActions.tsx
?? docs/
?? drizzle/0002_remove_examples.sql
?? lib/contact.ts
?? lib/content.ts
?? lib/media.ts
?? lib/structured-data.ts
?? public/design-preview/
?? screenshots/
```

Öne çıkan yeni/önemli dosyalar:

- `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `components/SiteHeader.tsx`, `components/PublicActions.tsx`, `components/JobCard.tsx` — public kompozisyon, conditional CTA, metadata, JSON-LD, mobil sabit ada.
- `lib/contact.ts`, `lib/content.ts`, `lib/seo.ts`, `lib/structured-data.ts`, `lib/validation.ts`, `lib/store.ts` — doğrulanmış veri kapısı, temsili fotoğraf gate’i, public yayın filtresi, güvenli Maps/`tel:`/JSON-LD.
- `app/api/media/[name]/route.ts`, `lib/media.ts`, `app/api/upload/route.ts` — private görsel depolama ve taslak/yayın erişim denetimi.
- `components/admin/JobForm.tsx`, `components/admin/SettingsForm.tsx`, tüm `app/admin/*` sayfaları — kobalt/bakır admine uyarlanmış, alan bazlı hata, ilk hataya odak, ayrı taslak/yayın akışı.
- `app/sitemap.ts`, `app/robots.ts`, `middleware.ts`, `drizzle/0002_remove_examples.sql`, `scripts/seed.ts` — production-only indeksleme, admin noindex, örnek kayıt temizliği.
- `docs/design-and-review.md`, `.agents/skills/iri-elektrik-ui/SKILL.md`, `README.md`, `prompt.md` — skill kararları, kurulum ve güncel brief.
- `screenshots/` — gerçek tarayıcı görüntüleri ve makine raporları.

## Komut sonuçları

| Komut | Sonuç |
|---|---|
| `npm run typecheck` (`tsc --noEmit`) | **Başarılı**, 0 hata |
| `npm run lint` (`eslint .`) | **Başarılı**, 0 uyarı/hata |
| `NEXT_PUBLIC_SITE_URL=https://iri-elektrik.vercel.app VERCEL_ENV=production DESIGN_PREVIEW=0 npm run build` | **Başarılı**: 15 route, `✓ Compiled successfully`, `✓ Generating static pages (15/15)`, tip/kontrol geçti |
| `npm ci --no-audit --no-fund` | 381 paket kuruldu; yalnızca `@esbuild-kit/*` deprecation ve eslint sürüm uyarısı |
| Final temiz production build | `data/store.json` ve test yüklemeleri silindikten sonra tekrarlandı; örnek/QA verisi statik sayfalara girmedi |

`next lint` yerine ESLint CLI kullanıldı; `.next*/**`, `public/**`, `screenshots/**` ve `drizzle/**` lint dışında tutuldu.

## 390 / 768 / 1440 px tarayıcı kontrolleri

Gerçek Chromium/Playwright, `reducedMotion: reduce`, device scale 1. Rapor: `screenshots/browser-checks.json`.

- 390, 768 ve 1440 px’te `horizontalOverflow: 0`, `docScrollWidth === viewportWidth`.
- 1440 px tasarım önizlemesi: 44/56 metin/fotoğraf ızgarası, fotoğraf kenara uzanıyor, `next/image` yüklendi, başlık 3 satırda kırılıyor, `Barlow Condensed` aktif, body `#F7F6F2`, nav `#151D2E`.
- 390/768 px önizleme: metin → eylemler → fotoğraf sırası; hizmetler hemen sonra; temsili fotoğraf etiketi görünüyor.
- Temiz production: fotoğraf yok, `hero--compact`, hizmetler ilk ekranda başlıyor; `tel:`/Maps anchor sayısı `0`, mobil CTA görünmüyor, iframe sayısı `0`.
- Klavye: 390/768 px’te menü Enter ile açılıyor, Escape ile kapanıyor; görünür focus ve 44 px hedefler korunuyor.
- `Hizmetler` bağlantısı `/#hizmetler` hedefine gidiyor ve render edilmiş `#hizmetler` bölümü mevcut.
- Arşiv boş durum `200`, olmayan kayıt `404`, `robots.txt` production allow + `/admin` disallow + sitemap, `sitemap.xml` yalnızca ana sayfa/arşiv içeriyor.
- Tek console `404`, bilinçli olarak test edilen `/yapilan-isler/olmayan-kayit` adresinden gelir.

Ekran görüntüleri: `screenshots/README.md` dosyasında tek tek açıklanır. Ana görüntüler: `screenshots/first-screen-preview-1440.png`, `screenshots/full-page-preview-1440.png`, `screenshots/first-screen-preview-390.png`, `screenshots/first-screen-production-1440.png`, `screenshots/first-screen-production-390.png`, `screenshots/full-page-production-390.png`.

## Uçtan uca doğrulama

Rapor: `screenshots/e2e-report.json` — **50 fonksiyonel kontrol geçti**, `reviewedOk: true`. Test yalnızca yerel production sunucusunda, Git’e alınmayan `data/store.json` / `data/uploads` üzerinde uydurma QA verisiyle yapıldı; sonrasında temizlendi. `screenshots/qa-verified-contact-*.png` dosyaları bu uydurma verinin kanıtıdır, üretim girdisi değildir.

Doğrulanan akışlar:

- Admin girişi, `iri_admin` oturum çerezi, yetkisiz `/admin` → `307`, yetkisiz `/api/upload` → `401`, yetkisiz taslak önizleme → `307`.
- Ayar formunda fotoğraf yükleme, verified telefon/adres/koordinat/saat kaydı; `tel:+905321234567`, `https://www.google.com/maps/dir/?api=1&destination=36.8%2C34.6`, bölge başlıkta, `AutoRepair` JSON-LD yalnızca sayfada görünen alanlarla, rating/review yok, harita iframe yok.
- Arama tıklaması `/api/event` POST üretiyor; hizmetler anchor hedefi çalışıyor.
- 390/768 px sabit CTA: `display:block`, iki düğme `48 px`, footer `padding-bottom:104px`, alt bilgiyle çakışma `-63 px`; form alanı odakta CTA gizli. 1440 px’te CTA `display:none`.
- Private görsel: taslak/anonim `404`, taslak/yönetici `200`, yayın/anonim `200`, yayından kaldırma sonrası anonim `404`.
- Yeni iş → kapak yükle → “Taslak kaydet” → admin listesinde **Taslak** → taslak public arşiv/detay/sitemap’te yok → “Yayımla” → ana sayfa/arşiv/detay/sitemap’te var → detay 200, dört aşama, görsel yüklendi, canonical/OG/robots doğru.
- Yayımlı slug değişince eski adres `307` ile yeni sluga yönleniyor; yeni slug sitemap’te.
- “Yayından kaldır” sonrası ana sayfa, arşiv, detay ve sitemap temizleniyor; detay `404`.
- İki console `404` kaydı, taslak ve yayından kaldırma sonrası bilinçli negatif URL testlerindendir; uygulama hatası değildir.

## Vercel durumu

Bağlı Vercel uygulaması `devlivenc` kullanıcısı olarak doğrulandı. Kişisel hesap ve `defaultTeamId` kapsamında `list_projects` / `list_deployments` boş döndü; `get_project("iri-elektrik")` `404 Project not found` verdi. Bu oturumda canlı projeye erişim/dağıtım yetkisi görünmediği için production deploy, canlı URL incelemesi ve canlı robots/sitemap/JSON-LD kontrolü **yapılamadı**. Canlı referans sayfası daha önce okundu; eski örnek/dev metinleri içeriyordu. Doğru Vercel hesabı/team bağlanmadan veya proje ID’si verilmeden canlı dağıtım yapılmamalıdır.

Yerelde iki sunucu çalışıyor: port `3000` tasarım önizlemesi (`DESIGN_PREVIEW=1`), port `3001` production doğrulaması (`DESIGN_PREVIEW=0`, `VERCEL_ENV=production`). Bunlar yalnızca sandbox önizlemesidir.

## Müşteriden / üretim ortamından gereken girdiler

1. Onaylı işletme adı, açık adres, ilçe, şehir.
2. Görünen telefon ve çalışan `tel:+90…` bağlantısı.
3. Enlem/boylam veya `google.com/maps/dir/?destination=…` biçiminde doğrulanmış yol tarifi hedefi.
4. Haftanın günlerine göre açılış/kapanış saatleri; tatil saatleri ayrıca Google İşletme Profili’ne girilmeli.
5. Varsa WhatsApp, e-posta, Google İşletme Profili URL’si.
6. Müşteri izni alınmış, plaka/yüz içermeyen gerçek atölye hero fotoğrafı, anlamlı alt metni ve açık onay işareti.
7. Sunulması onaylanan hizmetler; her biri için sürücünün anlayacağı belirti + yapılan iş metni.
8. Gerçek onarım kayıtları: kapak/galeri fotoğrafları, alt metin, Belirti / Teşhis / Uygulama / Sonuç.
9. Production env: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `NEXT_PUBLIC_SITE_URL`; production’da `DESIGN_PREVIEW` tanımlanmamalı.
10. Doğru Vercel projesine erişim, production deploy, Search Console mülk doğrulaması/sitemap gönderimi ve Google İşletme Profili doğrulaması.

Eksik alanlar public arayüzde tahmin edilmez; doğrulanmamış bilgi varsa iletişim bandı sade boş durum gösterir ve eylem düğmeleri gizlenir.

## Skill’ler ve son tasarım turu

- Anthropic `frontend-design` commit `41bbe19`: iki geçişli kompozisyon/tipografi/renk planı, ASCII wireframe ve öz eleştiri `docs/design-and-review.md` içinde kaydedildi.
- Vercel `react-best-practices` v1.0.0: sunucu bileşenleri, tek public istemci adası, `Promise.all`, `React.cache`, `revalidatePath`, private media route ve kritik yoldan çıkarılmış üçüncü taraf/ölçüm.
- Vercel `web-design-guidelines` v1.1.0 (`command.md` SHA-256 `d246b026f4f29b5823a9cc857f9edf3d2507002e055e32040cadeaf3b38e0234`): klavye, focus, 44 px, safe-area, form, reduced motion, hover ve sabit CTA bulguları `file:line` biçiminde `docs/design-and-review.md` içinde listelendi ve düzeltildi. Son turda açık bulgu yok.

## Ölçülemeyen / açık kalan kontroller

- Canlı production dağıtımı, canlı `robots.txt`/`sitemap.xml`/canonical/OG/JSON-LD incelemesi: Vercel projesine erişim olmadığı için yapılamadı.
- LCP ≤ 2,5 sn ve CLS ≤ 0,1 hedefleri için laboratuvar ölçümü yapılmadı; p75 INP ≤ 200 ms için canlı saha verisi yok.
- Google İşletme Profili doğrulaması, gerçek müşteri yorumları, Search Console mülk doğrulaması ve sitemap gönderimi işletme tarafından tamamlanmalı.
- Sıralama garantisi verilmez.
