---
name: iri-elektrik-ui
description: İri Oto Elektrik sitesi için güncel kobalt + bakır UI, veri doğrulama ve yayın kuralları. Public site, iş detayı ve yönetim paneli üretilirken veya incelenirken uygulanır.
---

# İri Oto Elektrik — güncel proje UI skill'i

1. İlk ekranda marka, arıza dili ve mevcut iletişim eylemi okunmalı. Masaüstünde metin %44 / fotoğraf %56; mobilde metin, eylem, fotoğraf sırası korunur.
2. Fotoğraf ve büyük başlıklar görsel ağırlığı taşır. Admin'de açık gri yüzey, taranabilir satırlar, küçük fotoğraf önizlemeleri, kobalt “Yeni iş ekle” ve metinle belirtilen yayın durumları önceliklidir.
3. Yalnızca onaylı hizmetler, doğrulanmış iletişim bilgileri ve eksiksiz yayımlanmış gerçek işler public çıktıya girer. Eksik eylem gizlenir; sahte bağlantı veya temsili görsel üretimde gösterilmez.
4. Hareket yalnızca kullanıcı eylemine yanıt verir; `prefers-reduced-motion` desteklenir. Skip link, görünür odak, 44 px dokunma alanı, safe-area ve klavye açıkken kalkan mobil çubuk korunur.
5. Teslimden önce 390 / 768 / 1440 px, masaüstü + mobil ekran görüntüsü, tel/Maps hedefi, hizmetler bağlantısı, iş detayı ve admin “Yeni iş ekle → Taslak kaydet → Yayımla → Yayından kaldır” akışı doğrulanır.

## Kaynak revizyonları ve kararlar

- Anthropic `frontend-design` (commit `41bbe19`, 2026-09): konu bir oto elektrik atölyesi, kitle arızası olan sürücü. Generic kart/gradient/sayaç düzeni reddedildi; tek güçlü öğe belgesel fotoğraf, geri kalan yapı tipografi ve hairline çizgilerle kurulur.
- Vercel `react-best-practices` v1.0.0: Server Components varsayılan; public etkileşim tek `PublicActions` istemci adasında toplanır. Bağımsız veriler `Promise.all`, per-request okumalar `React.cache`, yayın sonrası `revalidatePath`. Fotoğraf yüklemeleri paralel; üçüncü taraf iframe ilk render'da yok.
- Vercel `web-design-guidelines` v1.1.0 (`command.md` SHA-256 `d246b026f4f29b5823a9cc857f9edf3d2507002e055e32040cadeaf3b38e0234`): semantik HTML, alan bazlı hata + ilk hataya odak, görünür `focus-visible`, formlarda `autocomplete`/doğru `type`, `transition: all` yasağı, azaltılmış hareket ve safe-area denetimi.

## Tasarım kararları (güncel brief)

- Renk: porselen `#F7F6F2`, gece mavisi `#151D2E`, kobalt `#2452CC`, bakır `#B86B45`, soğuk gri `#E8EDF4`, ayırıcı `#D4DAE5`. Porselen hâkim; gece mavisi nav + iletişim bandı; kobalt birincil eylem; bakır yalnızca kısa başlık çizgileri ve küçük ikon detayları. Bakır küçük gövde metninde kullanılmaz.
- Tip: Türkçe karakter destekli Barlow Condensed 600/700 başlık, Instrument Sans 400/500/600/700 gövde. Hero `clamp(2.625rem, 6vw, 5.375rem)` = 42–86 px; başlıklarda `text-wrap: balance`.
- Düzen: hero'dan hemen sonra ince çizgili dikey hizmet listesi; tek geniş iş fotoğrafı + sonuç özeti; koyu iletişim bandı. Dalgalı kablo motifi, tekrar eden kartlar, parlayan gradyan, dekoratif sayaç ve ALL-CAPS etiket yok.
- Fotoğraf: onaylı hero fotoğrafı admin ayarlarından yüklenir. Onay yoksa yalnızca yerel/Vercel preview tasarım önizlemesinde açıkça etiketlenmiş temsili fotoğraf görünür; production kompakt tipografik hero gösterir.
- İletişim: yalnızca doğrulanmış `tel:` ve doğrudan `google.com/maps/dir/?destination=…` bağlantıları. Harita iframe'i ilk yüklemeye alınmaz. `AutoRepair` JSON-LD yalnızca sayfada görünen doğrulanmış alanlardan oluşur.

## Next.js 15.5 kararları

- Metadata API ile sayfa bazlı canonical/OG; yalnızca Vercel production indekslenebilir. Admin/önizleme `noindex` + `X-Robots-Tag`; sitemap yalnızca gerçek yayımlanmış işleri listeler.
- Public sorgular örnek/taslak/eksiksiz olmayan kayıtları filtreler. Yayın değişikliği ana sayfa, arşiv, detay, sitemap ve robots önbelleğini tazeler.
