---
name: iri-elektrik-ui
description: İri Oto Elektrik sitesi için proje özel UI ve ürün kuralları. Landing, iş detayı ve yönetim paneli üretirken ve incelerken uygulanır; mobil öncelikli, Türkçe, tek dokunuşla arama/yol tarifi odağı.
---

# İri Oto Elektrik — proje UI skill'i

Bu kuralları landing, iş detayı ve yönetim paneli üretirken ve incelerken uygula.

1. İlk ekranda marka, hizmet ve ana eylem okunmalı. Masaüstünde metin ve atölye fotoğrafını asimetrik yerleştir. Mobilde iletişim eylemlerini tek elle erişilebilir tut.
2. Kamuya açık sayfalarda işçilik fotoğrafları ve büyük başlıklar görsel ağırlığı taşısın. Admin'de taranabilir satırlar, fotoğraf önizlemeleri ve metinle belirtilen yayın durumları öncelikli olsun.
3. Bir animasyonu ancak yön, etkileşim veya durum değişimini anlaşılır kılıyorsa ekle. Hareket azaltma tercihine saygı duy.
4. Teslimden önce bir masaüstü ve bir mobil ekran görüntüsünü başlık, CTA, okunabilirlik ve taşma açısından incele. Admin'de klavyeyle "Yeni iş ekle" → "Taslak kaydet" → "Yayımla" akışını tamamla ve sonucun public sayfada belirdiğini doğrula.

## Tasarım kararları (frontend-design rev. 41bbe19)

- Konu: Mersin/Tarsus oto elektrik atölyesi. Kitle: aracı arızalanan, telefondan arayan sürücü. İş: tek dokunuşla arama/yol tarifi + gerçek onarım fotoğraflarıyla güven.
- Renk (brief sabit): kırık beyaz #F5F3EC, koyu petrol #102A2A, grafit #151917, limon #D9F34A. Limon zeminde koyu metin. Türev ton yalnızca petrol/kâğıt ara tonları.
- Tip: başlık Barlow Condensed (600/700), metin Instrument Sans. İki aile belirgin farklı genişlikte. Başlıklarda text-wrap: balance, satır uzunluğu ≤ ~65 karakter.
- Düzen: asimetrik editoryal. Hero metin 7 kolon / fotoğraf 5 kolon, fotoğraf aşağı kayık. Hizmetler kart değil, hairline kurallı editoryal liste. İşler fotoğraf öncelikli büyük satırlar. Kablo izi motifi yalnızca bölüm geçişinde.
- Yasaklar: tam ekran animasyon, cam kart dizileri, stok otomobil reklamı estetiği, dekoratif sayaç, sahte sosyal kanıt, tek kelimeyi renklendiren başlık, ALL-CAPS etiketler, "→" ekli bağlantılar.
- Cesaret tek yerde: limon CTA + kablo motifi. Geri kalan her şey sakin ve disiplinli.

## Mimari kararları (react-best-practices v1.0.0)

- Server Components varsayılan; istemci bileşenleri etkileşimli adalarla sınırlı (mobil menü, mobil CTA çubuğu, admin formları, onay dialogları).
- Bağımsız veri istekleri Promise.all ile paralel; istek başına React.cache() ile tekilleştirme.
- Barrel import yok; ağır admin bileşenleri dinamik import ile koşullu yüklenir.
- Üçüncü taraf kod (harita/analitik) ilk render kritik yolunda yok; tıklama ölçümü hafif iç olayla.

## Erişilebilirlik kararları (web-design-guidelines v1.1.0)

- Skip link, hiyerarşik başlıklar, semantik HTML; görünür focus-visible halkası; outline:none yalnızca focus-visible ile birlikte.
- Formlar: label + name + autocomplete, alan bazında hata, ilk hataya odak, submit istek süresince spinner ile kilitli.
- Hareket yalnızca transform/opacity, transition:all yok, prefers-reduced-motion saygı.
- Mobil CTA çubuğu safe-area içinde, içeriği ve klavye odağını kapatmaz (odaklandığında gizlenir, alt boşluk bırakılır).
- Tarih/saat Intl.DateTimeFormat (tr-TR); sayılar tabular-nums.

## Next.js kararları (15.5.x, nextjs.org/docs/app/guides/ai-agents)

- App Router, metadata API (sayfaya özgü title/description/canonical/OG), sitemap.ts/robots.ts, revalidatePath ile yayın sonrası önbellek tazeleme.
- Üretim dışı ortamda noindex; admin/önizleme/taslak sitemap dışında.
