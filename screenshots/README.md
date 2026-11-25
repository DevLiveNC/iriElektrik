# Ekran görüntüleri ve tarayıcı kanıtları

Bu klasör, 25 Kasım 2026 tarihinde gerçek Chromium/Playwright oturumunda alınmış ekran görüntülerini ve makine tarafından okunabilir doğrulama raporlarını içerir.

## Temiz, yayınlanabilir durum

- `first-screen-preview-1440.png`, `full-page-preview-1440.png` — `DESIGN_PREVIEW=1` ile kenara uzanan atölye fotoğrafı; fotoğraf açıkça “Temsili fotoğraf — yalnızca tasarım önizlemesi. Üretimde yayımlanmaz.” olarak etiketlidir.
- `first-screen-preview-390.png`, `full-page-preview-390.png` — 390 px tasarım önizlemesi; metin/eylemler fotoğraftan önce, hizmetler hemen sonra.
- `first-screen-preview-768.png`, `full-page-preview-768.png` — 768 px tablet kontrolü.
- `first-screen-production-1440.png`, `full-page-production-1440.png` — `DESIGN_PREVIEW=0`, `VERCEL_ENV=production` ile kompakt tipografik hero. Doğrulanmış iletişim verisi olmadığı için `tel:`/`Yol tarifi` düğmeleri yoktur.
- `first-screen-production-390.png`, `full-page-production-390.png` — aynı temiz production durumunun mobil görünümü.
- `first-screen-production-768.png`, `full-page-production-768.png` — aynı temiz production durumunun tablet görünümü.
- `browser-checks.json` — 390/768/1440 px için hesaplanmış renkler, font, başlık satır sayısı, hero/servis ölçüleri, yatay taşma, klavye menüsü, CTA, canonical/robots ve rota durumları. Tek console `404`, bilinçli olarak test edilen `/yapilan-isler/olmayan-kayit` adresinden gelir.

## Yalnızca QA test fixture’ı

- `qa-verified-contact-mobile.png`, `qa-verified-contact-desktop.png` — uçtan uca testte kullanılan **uydurma** telefon/adres/koordinat/saat verisiyle çağrı ve yol tarifi eylemlerinin gerçekten render edildiğini gösterir. Bu veriler üretim girdisi değildir, depoya/public siteye yazılmaz.
- `e2e-report.json` — admin girişi, yetkisiz erişim, ayar kaydı, private görsel yükleme, taslak→yayın→slug yönlendirmesi→yayından kaldırma, sitemap, canonical/OG/robots, 390/768/1440 px CTA ve form odak kontrolleri. İki console `404`, taslak ve yayından kaldırılmış detay URL’lerinin bilinçli negatif testlerindendir; tüm fonksiyonel kontroller geçti.

`DELIVERY.md` bu sonuçların özetini ve müşteriye açılış için gereken doğrulanmış girdileri içerir.
