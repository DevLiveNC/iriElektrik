# İri Oto Elektrik — Next.js geliştirme promptu

Deneyimli bir ürün tasarımcısı ve full-stack geliştirici olarak bu depoda sıfırdan, Türkçe, mobil öncelikli ve Vercel’e dağıtılabilir bir oto elektrik sitesi geliştir. Amaç Google aramasından gelen sürücünün hizmeti, konumu ve çalışma saatlerini hızla anlaması, tek dokunuşla araması veya yol tarifi almasıdır. İşletme sahibinin yayımladığı onarım örnekleri bu güveni desteklesin. Çalışan uygulamayı ve README’yi teslim et.

## 1. Skill çalışma düzeni

Bu dosyadaki “Projeye özel UI skill’i” bölümünü başlangıçta uygula. Geliştirme ajanı proje skill’lerini destekliyorsa bu bölümü `.agents/skills/iri-elektrik-ui/SKILL.md` olarak, `name: iri-elektrik-ui` ve amacını açıklayan `description` alanlarıyla kaydet. Aşağıdaki kaynakları ilgili aşamada oku ve kararlarını denetle. Skill kurulum aracın varsa ilgili skill’i proje kapsamına, incelediğin kaynak revizyonuyla kur. Kaynak depoların tamamını veya üçüncü taraf lisans metinlerine tabi içerikleri kopyalama. Kurulum mümkün değilse bağlı SKILL.md ve gerekli referansları doğrudan oku. Uygulama sonunda kullanılan kaynakları, revizyonları, somut kararları ve açık kalan bulguları kaydet.

| Kaynak | Aşama | Beklenen çıktı |
| --- | --- | --- |
| [Anthropic frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | Tasarımdan önce | Atölye fotoğrafı, asimetrik kompozisyon, tipografi ve CTA hiyerarşisini tanımlayan kısa tasarım kararları |
| [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) | Mimari ve kod incelemesi | Sunucu/istemci sınırları, bağımsız veri istekleri, yüklenen JS ve gereksiz render kontrolü |
| [Vercel Web Design Guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | Ekranlar tamamlanınca | Mobil, klavye, form, odak, hareket ve semantik HTML denetimi. Kaynaktaki güncel kılavuzu aç, bulguları dosya/satır ile kaydet ve düzelt. |
| [Next.js resmi ajan rehberi](https://nextjs.org/docs/app/guides/ai-agents) | Next.js kararları | Kurulu sürümle eşleşen dokümanları kullan. Önbellek ve metadata API’lerini o sürüme göre doğrula. |

## 2. Görsel yön ve landing page

Atölyenin belgesel fotoğrafları etrafında bir editoryal düzen kur. Kırık beyaz #F5F3EC, koyu petrol #102A2A, grafit #151917 ve eylem vurgusu için limon #D9F34A kullan. Limon zeminde koyu metin uygula. Başlıklarda Türkçe karakterleri iyi çizilmiş dar bir tipografi (ör. Barlow Condensed), metinde Instrument Sans kullan. Küçük bir kablo izi motifi yalnızca bölüm geçişinde görünsün. Tam ekran animasyon, cam kart dizileri, stok otomobil reklamı estetiği, dekoratif sayaç ve sahte sosyal kanıt kullanma. İçerik bloklarının ritmini ölçek ve boşlukla kur.

- Üst gezinme: marka, Hizmetler, Yapılan işler, Konum, Hemen ara. Mobilde basit menü ve alt güvenli alana oturan “Ara” / “Yol tarifi” çubuğu. Çubuk sayfa içeriğini ve klavye odağını kapatmasın.
- Hero: solda “Aracın elektriğini çözüyoruz.” ve doğrulanmış bölgeyle kısa hizmet tanımı, sağda açık kaput altında çalışan ustanın ellerini gösteren gerçek atölye fotoğrafı. “Hemen ara” ve “Yol tarifi” ilk ekranda. Mobilde başlık ve eylemler fotoğraftan önce gelir.
- Hizmetler: editoryal liste. Akü ve şarj sistemi, marş ve alternatör, aydınlatma, tesisat ve arıza tespiti yalnızca müşteri onayıyla yayımlanacak adaylardır. Her onaylı hizmette müşterinin yaşadığı belirtiyi ve işletmenin sunduğu hizmeti açık Türkçeyle anlat.
- Yapılan işler: ana sayfada öne çıkan işler, /yapilan-isler sayfasında arşiv, /yapilan-isler/[slug] sayfasında fotoğraflar ve “Belirti / Teşhis / Uygulama / Sonuç”. Yeterli içerik varsa kategori filtresi. Boş içerikte bölümü uygun biçimde gizle veya sade bir durum göster.
- Konum ve iletişim: doğrulanmış adres, telefon, saatler, harita yönlendirmesi ve varsa WhatsApp. Ağır harita embed’i eylem sonrasına bırak. Saat verisi yoksa açık/kapalı etiketi basma. Mobilde CTA’lar dokunma alanı, safe area ve ekran klavyesiyle test edilsin.

İşletme adı, ilçe/şehir, adres, koordinat, telefon, saat ve profil URL’si için doğrulanmış veri bekle. “İri Oto Elektrik” çalışma adıdır. Eksik alanları tasarım önizlemesinde örnek olarak açıkça belirt, üretimde tahmini bilgi ve boş bağlantı gösterme. Gerçek onarım olarak temsili görsel yayımlama. Gerçek fotoğraflarda müşteri izni, plaka/yüz maskelemesi ve anlamlı alt metin iste.

### Projeye özel UI skill’i

Bu kuralları landing, iş detayı ve yönetim paneli üretirken ve incelerken uygula.

1. İlk ekranda marka, hizmet ve ana eylem okunmalı. Masaüstünde metin ve atölye fotoğrafını asimetrik yerleştir. Mobilde iletişim eylemlerini tek elle erişilebilir tut.
2. Kamuya açık sayfalarda işçilik fotoğrafları ve büyük başlıklar görsel ağırlığı taşısın. Admin’de taranabilir satırlar, fotoğraf önizlemeleri ve metinle belirtilen yayın durumları öncelikli olsun.
3. Bir animasyonu ancak yön, etkileşim veya durum değişimini anlaşılır kılıyorsa ekle. Hareket azaltma tercihine saygı duy.
4. Teslimden önce bir masaüstü ve bir mobil ekran görüntüsünü başlık, CTA, okunabilirlik ve taşma açısından incele. Admin’de klavyeyle “Yeni iş ekle” → “Taslak kaydet” → “Yayımla” akışını tamamla ve sonucun public sayfada belirdiğini doğrula.

## 3. Yönetim paneli ve veri akışı

/admin alanı için açık renkli, sade içerik yönetimi kur. İlk ekran “Yapılan işler” listesi ve “Yeni iş ekle” eylemi olsun. Küçük ekranda liste okunur dikey satırlara dönsün. Ekleme, düzenleme, sıralama, öne çıkarma, önizleme, taslak kaydetme, yayımlama, yayından kaldırma ve arşivleme çalışsın. Kritik işlemlerde onay, form hatalarında alan bazında açıklama ve başarılı işlemlerde Türkçe geri bildirim sun.

İş modelinde başlık, benzersiz slug, kategori, isteğe bağlı araç bilgisi, belirti, teşhis, uygulama, sonuç, kapak ve galeri, alt metin, durum, yayın tarihi, sıralama ve öne çıkarma alanları olsun. Yayımlanmış slug’ı sabit tut veya değişiklikte eski adresten yönlendir. İşletme ayarları tek kaynaktan düzenlensin. Public sayfalar yalnızca yayımlanmış kayıtları sunsun. Taslak önizleme oturum gerektirsin. Yayımlama ve yayından kaldırma sonrası ana sayfa, arşiv, detay ve sitemap ilgili önbellekten güncellensin.

Next.js App Router, TypeScript strict, Tailwind CSS, PostgreSQL (ör. Neon), bir migration aracı ve kalıcı nesne depolama (ör. Vercel Blob) kullan. Uyumlu ve güncel kararlı sürümleri lockfile ile sabitle. Server Components varsayılan olsun. İstemci bileşenlerini etkileşimli adalarla sınırla. Yönetici oturumunu Auth.js veya doğrulanmış bir eşdeğerle kur, kayıt ekranı açma. Her yazma işlemi ve önizlemede sunucuda rol kontrolü ve şema doğrulaması uygula. Yüklemelerde dosya boyutu, izin verilen görsel türü ve gerçek dosya içeriğini sunucuda doğrula. Dosya yükleme tamamlanmadan iş kaydını görselle yayımlama. Başarısız yükleme/kayıt durumunda yeniden deneme ve eski kapak korunumu sağla. Taslak görsellerini de erişim kontrolüne al. Secret değerlerini .env.example dosyasına koyma, yalnızca adlarını belgele.

## 4. Google görünürlüğü

- Onaylanmış işletme adı, adres ve telefon web sitesinde ve Google İşletme Profili’nde tutarlı olsun. Profil doğrulama, gerçek kategori, çalışma ve tatil saatleri, atölye fotoğrafları, site bağlantısı ve gerçek müşterilerden yorum isteme adımlarını yayın sonrası kontrol listesine yaz. Sıralama garantisi verme. [Google İşletme Profili yerel sıralama rehberi](https://support.google.com/business/answer/7091)
- Sunucuda üretilen semantik içerik, sayfaya özgü title/description, canonical, Open Graph, sitemap ve robots kur. Admin, önizleme ve taslaklar sitemap’e girmesin. Üretim dışı ortamlarda noindex uygula. İşletme verileri doğrulanınca sayfada görünen bilgilerle tutarlı AutoRepair JSON-LD üret. Uydurma puan ve yorum işaretleme. [Google yerel işletme yapılandırılmış veri rehberi](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- Yer adını doğal biçimde kullan. Her yeni hizmet sayfası için ayrı arama niyetini karşılayacak gerçek işletme içeriği gerekli. Tekrarlı bölge sayfaları üretme. Search Console mülk doğrulaması, sitemap gönderimi ve URL incelemesini README’de belgele.
- Ölçüm yapılandırılmışsa arama, yol tarifi ve WhatsApp tıklamalarını ayrı olaylar olarak ölç. Bu verileri tamamlanmış görüşme veya müşteri sayısı olarak raporlama. Harita, analitik ve diğer üçüncü taraf kodlarını ilk render’ın kritik yolundan çıkar.

## 5. Uygulama sırası ve kabul ölçütleri

1. Repo durumunu ve skill kaynaklarını incele. 390, 768 ve 1440 pikselde landing, iş detayı ve admin için tasarım kararlarını ver.
2. Landing, arşiv, gerçek veri modeli ve doğrulanmış iletişim eylemlerini uygula. Görselleri next/image ile boyutlandır, hero LCP görselini uygun şekilde önceliklendir, alt içerikleri gecikmeli yükle.
3. Migration, yönetici oturumu, fotoğraf, CRUD ve yayın akışını tamamla. Taslaktan yayına, yayından arşive geçişin doğrudan bağlantı, liste ve sitemap sonuçlarını kontrol et. Yetkisiz erişimde değişiklik ve taslak okuma engellensin.
4. Klavye navigasyonu, görünür odak, renk kontrastı, azaltılmış hareket, 390/768/1440 piksel, boş/hata durumları, bozuk bağlantılar, canonical, JSON-LD ve sitemap’i denetle. Mobil profil altında LCP ≤ 2,5 sn ve CLS ≤ 0,1 hedefle. Canlı saha verisi oluştuğunda p75 INP ≤ 200 ms hedefini ayrıca izle. Ölçüm ortamını belirt.
5. Lint, tip kontrolü, üretim build’i ve yayın akışının uçtan uca kontrolünü çalıştır. README’ye yerel kurulum, env, migration, güvenli ilk yönetici kurulumu, Vercel deploy, Google kontrol listesi ve doğrulanması gereken işletme girdilerini ekle. Eksik girdileri ve ölçülemeyen kontrolleri sonuçta açıkça belirt.
