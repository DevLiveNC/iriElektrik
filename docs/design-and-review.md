# Tasarım planı ve son erişilebilirlik/mimari turu

## 1. Anthropic frontend-design — uygulama öncesi iki geçiş

Kaynak: `anthropics/skills` `frontend-design/SKILL.md`, commit `41bbe19` (2026-09). Üçüncü taraf lisans metni kopyalanmadı; yalnızca kararlar kaydedildi.

### Konu ve birincil iş

Yerel Türk oto elektrik atölyesi. Kitle, Google aramasından gelen ve aracında belirti gören sürücü. İlk ekranın işi: hangi elektrik arızalarının ele alındığını anlatmak ve yalnızca doğrulanmış veri varsa tek dokunuşla `tel:` veya doğrudan yol tarifi vermek. Güven, gerçek onarım kayıtları ve atölye fotoğrafıyla kurulur; örnek kayıt, sahte bağlantı ve temsili görsel üretimde yayımlanmaz.

### Birinci geçiş — kompozisyon, tipografi, renk, ilkeler

Masaüstü, 1440 px:

```text
┌────────────────────────────────────────────────────────────┐
│ gece mavisi nav: marka   Hizmetler  Yapılan işler  Konum │
├──────────────────────────┬─────────────────────────────────┤
│ porselen %44             │ kenara uzanan atölye fotoğrafı  │
│ ince bakır kural         │ %56, next/image, LCP priority    │
│ 72–86 px dar başlık      │                                 │
│ arıza dilli özet         │                                 │
│ [Hemen ara] [Yol tarifi] │                                 │
├──────────────────────────┴─────────────────────────────────┤
│ Hizmetler — hairline satırlar: başlık / Belirti / Yapılan iş│
│ ───────────────────────────────────────────────────────────│
│ tek geniş gerçek iş fotoğrafı + kısa Sonuç                  │
│ ───────────────────────────────────────────────────────────│
│ gece mavisi Konum ve iletişim: adres / telefon / saatler    │
└────────────────────────────────────────────────────────────┘
```

Mobil, 390 px:

```text
gece mavisi nav + klavye menüsü
başlık → arıza özeti → yalnızca var olan eylemler
kenara uzanan fotoğraf (önizlemede temsili etiketli)
Hizmetler: dikey tek eksen, ince ayırıcılar
Konum bandı
yalnızca var olan Ara / Yol tarifi sabit adası + safe-area
```

Renk: porselen `#F7F6F2` hâkim; gece mavisi `#151D2E` nav/iletişim; kobalt `#2452CC` birincil eylem; bakır `#B86B45` yalnızca kısa kural/küçük ikon; soğuk gri `#E8EDF4` ikincil yüzey; `#D4DAE5` hairline. Tip: Türkçe karakterli Barlow Condensed 600/700 + Instrument Sans 400–700; hero `clamp(2.625rem, 6vw, 5.375rem)` = 42–86 px.

İlkeler: tek güçlü öğe fotoğraf; tipografi ve boşluk ikinci planda; kart dizisi, gradyan, sayaç, dalgalı kablo, ALL-CAPS etiket, dekoratif hareket yok. Eksik veri tahmin edilmez; ilgili eylem/bölüm sessizce gizlenir. Onaylı fotoğraf yoksa production kompakt tipografik hero, tasarım önizlemesi açık etiketli temsili fotoğraf kullanır.

### İkinci geçiş — öz eleştiri ve düzeltmeler

- İlk fikirde fotoğraf yuvarlak kart içinde kalıyordu; kenara uzanan `%56` yüzeye çıkarıldı.
- Hero altı büyük boşluk ve dalgalı ayırıcı kaldırıldı; hizmetler hemen sonraki bölüm oldu.
- “Hizmetler” menüsü yalnızca onaylı servis varsa render edilir ve `#hizmetler` hedefine gider.
- İki CTA yerine veri varsa bir veya ikisi; veri yoksa hiçbiri. Soluk disabled düğme yok.
- Bakır yalnızca kısa başlık çizgisi ve hizmet ikonunda kaldı; küçük gövde metninde kullanılmadı.
- Üretimde örnek metin, şematik kaput SVG’si, örnek iş ve temsili görsel kaldırıldı.

## 2. Vercel React Best Practices — mimari turu

Kaynak: `vercel-labs/agent-skills` `react-best-practices` v1.0.0 / `AGENTS.md`. Uygulanan kararlar:

- `app/layout.tsx:80` ve `app/page.tsx:56` sunucu bileşenleridir; tek public istemci adası `components/PublicActions.tsx:37` içinde tutuldu.
- `app/page.tsx:51`, `app/api/media/[name]/route.ts:42` ve `app/admin/actions.ts:157` bağımsız işleri `Promise.all` ile başlatır.
- `lib/store.ts:123` public yayın kapısı tek kaynak; `app/sitemap.ts`, ana sayfa, arşiv ve detay aynı `listPublishedJobs()` filtresini kullanır.
- `app/admin/actions.ts:16` yayın değişikliğinde ana sayfa, arşiv, ilgili detay, sitemap ve robots önbelleğini tazeler.
- `app/api/media/[name]/route.ts:10` dinamik Node route’u; taslak görselleri private Blob/yerel dosyada, erişim denetimi sunucuda.
- Üçüncü taraf harita iframe’i ilk render’da yok; `PublicActions` ölçümü `sendBeacon` ile kritik yoldan ayırır.

## 3. Vercel Web Design Guidelines — son tur bulgular ve düzeltmeler

Kaynak: `vercel-labs/agent-skills` `web-design-guidelines` v1.1.0; `references/command.md` SHA-256 `d246b026f4f29b5823a9cc857f9edf3d2507002e055e32040cadeaf3b38e0234`. Çıktı biçimi `file:line`, terse bulgular.

- `app/globals.css:1069` — sabit CTA tüm genişliklerde görünüyordu; `display:none` + `@media (max-width:960px)` ile yalnızca mobil/tablette gösterildi.
- `app/globals.css:1096` — sabit CTA alt bilgiyi kapatıyordu; `body:has(.mobile-cta)` ile `6.5rem + safe-area` alt boşluğu eklendi. 390 px tarayıcı ölçümünde çakışma `-63 px`.
- `components/PublicActions.tsx:57` — form alanına odaklanıldığında çubuk kalkıyor; klavye odağı kapanmıyor.
- `components/SiteHeader.tsx:24` — Escape mobil menüyü kapatıp odağı menü düğmesine döndürüyor; `aria-expanded`/`aria-controls` mevcut.
- `components/admin/JobForm.tsx:47` — React 19 form action gönderiminde çoklu submit düğmesinin `status` değeri FormData’ya girmedi; gizli `status` alanı ve `chooseStatus()` ile “Yayımla” gerçekten `published` kaydı yazıyor.
- `components/admin/JobForm.tsx:61` — sunucu doğrulama hatasında ilk hatalı alana odaklanıyor; alan bazlı `role="alert"` mesajları var.
- `app/globals.css:108`, `app/globals.css:156`, `app/globals.css:1436` — görünür `focus-visible`, en az 44 px hedefler ve form odak halkaları korunuyor.
- `app/globals.css:1077` — `env(safe-area-inset-bottom, 0px)` sabit çubukta uygulanıyor.
- `app/globals.css:1928` — `prefers-reduced-motion: reduce` animasyon/geçişleri kapatıyor.
- `app/api/upload/route.ts:44` — dosya boyutu, bildirilen MIME ve gerçek magic-byte birlikte doğrulanıyor.
- `app/api/media/[name]/route.ts:42` — taslak görseli anonim istekte 404, yönetici oturumunda 200; yayımlanmış görsel anonim istekte 200, yayından kaldırılınca tekrar 404.
- `screenshots/e2e-report.json` — 390/768/1440 px yatay taşma `0`; 390/768 px CTA düğmeleri `48 px`, 1440 px CTA `display:none`; hizmet bağlantısı hedefi, klavye menüsü, azaltılmış hareket ve form odak davranışı tarayıcıda doğrulandı.

Açık bulgu yok. İki console `404` kaydı, E2E’de bilinçli olarak çağrılan taslak detay ve yayından kaldırma sonrası detay URL’lerinden gelir; uygulama hatası değildir.
