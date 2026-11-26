/**
 * Public landing sayfasının tüm sabit metinleri.
 *
 * Kural: Kullanıcıya görünen her yeni metin burada tutulur. Sayfa bileşenleri
 * metni gömmez; böylece işletme metinleri ileride tek yerden güncellenebilir.
 * Resmî/onaylı metinler (başlık, alt başlık, hizmet belirtileri, iş akışı)
 * birebir korunur; değiştirilmez.
 */

export interface LandingPrinciple {
  readonly title: string;
  readonly description: string;
}

/** Hero başlığı altındaki üç ilke — resmî metin, birebir. */
export const LANDING_PRINCIPLES: readonly LandingPrinciple[] = [
  {
    title: "Ölçümle tespit",
    description: "Tahminle parça değişimi yerine cihaz ve multimetre kontrolü",
  },
  {
    title: "Açık anlatım",
    description: "Arızanın nedenini ve yapılacak işlemi sade dille paylaşım",
  },
  {
    title: "Kontrollü teslim",
    description: "İşlem sonrası şarj, marş ve aydınlatma yük kontrolü",
  },
] as const;

export interface WorkflowStep {
  readonly num: string;
  readonly tag: string;
  readonly title: string;
  readonly description: string;
}

/** "Nasıl çalışıyoruz?" — dört adım, resmî metin, birebir. */
export const WORKFLOW_STEPS: readonly WorkflowStep[] = [
  {
    num: "01",
    tag: "İlk kontrol",
    title: "Şikâyeti dinleme ve ön inceleme",
    description:
      "Aracın sorunu sabah ilk marşta mı, yolda giderken mi yoksa aralıklı olarak mı yaptığını dinler; akü başları, sigortalar ve ana soketleri gözden geçiririz.",
  },
  {
    num: "02",
    tag: "Ölçüm & teşhis",
    title: "Ölçümle nokta arıza tespiti",
    description:
      "Deneme-yanılma ile sağlam parçayı değiştirmeyiz. Multimetre, yük testi ve arıza tespit cihazıyla sorunun gerçek kaynağını net olarak belirleriz.",
  },
  {
    num: "03",
    tag: "Onay & uygulama",
    title: "Açık bilgilendirme ve temiz işçilik",
    description:
      "Arızanın nedenini ve yapılacak işlemi anlaşılır biçimde paylaşırız. Onayının ardından tesisat düzenini bozmadan, sağlam bağlantı ve izolasyonla onarımı yaparız.",
  },
  {
    num: "04",
    tag: "Son kontrol",
    title: "Yük altında test ve teslim",
    description:
      "Teslimden önce marş, şarj gerilimi, aydınlatma ve gösterge kontrollerini tekrar yapar; sorunun tamamen giderildiğinden emin olduktan sonra aracı teslim ederiz.",
  },
] as const;

/** Bölüm başlıkları ve giriş metinleri. */
/**
 * Mono/uppercase göz etiketleri.
 * Türkçe büyük harf dönüşümü tarayıcıdan bağımsız olarak doğru olsun diye
 * metinler burada elle büyütülmüş hâlde durur (i → İ).
 */
export const HERO_EYEBROW = "OTO ELEKTRİK ATÖLYESİ";

export const SERVICES_HEADING = "Aracın verdiği belirtiden çözüme";
export const SERVICES_INTRO =
  "Sürücünün yolda veya sabah ilk çalıştırmada karşılaştığı sorunları ve atölyede yaptığımız kontrolleri net başlıklarla listeliyoruz.";
export const SERVICES_EYEBROW = "HİZMETLER";

export const WORKFLOW_HEADING = "Nasıl çalışıyoruz?";
export const WORKFLOW_EYEBROW = "İŞ AKIŞI";
export const WORKFLOW_INTRO =
  "Aracını atölyeye getirdiğinde hangi sırayla kontrol yapılacağını baştan bilirsin. Ölçüm yapmadan karar vermiyor, onay almadan işlem başlatmıyoruz.";

export const BATTERY_FINDER_HEADING = "Aracına uygun aküyü birlikte netleştirelim.";
export const BATTERY_FINDER_INTRO =
  "Marka, model ve yılı seç; sonuç bir sipariş veya stok listesi değil, ölçüm ve doğru akü için bize yazmanın kısa yoludur.";
export const BATTERY_FINDER_EYEBROW = "AKÜ SEÇİCİ";

export const SOUND_HEADING = "Teyp ve ses sistemi.";
export const SOUND_EYEBROW = "TEYP VE SES";
export const SOUND_BODY =
  "Ünite, hoparlör ve kablolamayı mevcut tesisata zarar vermeden uygularız. Onayın olmadan işe başlamayız.";

export const CONTACT_HEADING = "Konum ve iletişim";
export const CONTACT_EYEBROW = "İLETİŞİM VE ULAŞIM";

export const JOBS_HEADING = "Yapılan işler";
export const JOBS_EYEBROW = "ATÖLYE KAYITLARI";

/** Boş durum cümleleri — resmî metin, birebir. */
export const CONTACT_EMPTY_SENTENCE =
  "İletişim bilgileri doğrulandığında açık adres, çalışma saatleri, telefon ve yol tarifi bağlantısı burada yer alır.";
export const JOBS_EMPTY_TITLE = "Henüz yayımlanmış iş kaydı yok.";
export const JOBS_EMPTY_SUB =
  "Müşteri izni alınmış gerçek onarım örnekleri eklendiğinde burada listelenir.";

/** Ortak arayüz etiketleri. */
/** Yapısal etiketler — doğal yazımla kullanılır (Türkçe i → İ sorunu olmaz). */
export const LABELS = {
  symptom: "Belirti",
  work: "Yapılan iş",
  make: "Marka",
  model: "Model",
  year: "Yıl",
  before: "Önce",
  after: "Sonra",
  slider: "Karşılaştırma kaydırıcısı",
  representativeTag: "TEMSİLİ GÖRSEL",
  pendingTag: "GÖRSEL BEKLENİYOR",
  scopeBadge: "YENİ KAPSAM",
  pendingFieldsTitle: "BEKLEYEN ALANLAR",
} as const;

export const UI = {
  ownerNote: "Bu alan işletme tarafından henüz girilmedi.",
  representativeCaption: "Temsili görsel, atölyenin kendi fotoğrafı değildir.",
  scopeBadge: "Yeni kapsam",
  scopeNote:
    "Bu bölüm işletmenin hizmet kapsamını genişletme isteğiyle eklendi; onaylı fotoğraf ve alt metin bekliyor.",
  skipToContent: "İçeriğe atla",
  menuOpen: "Menü",
  menuClose: "Kapat",
  callNow: "Hemen ara",
  whatsapp: "WhatsApp",
  directions: "Yol tarifi",
  servicesCta: "Hizmetleri incele",
  workflowCta: "Nasıl çalışıyoruz?",
  scrollTop: "Yukarı çık",
  backToTop: "Yukarı çık ↑",
  seeAllJobs: "Tüm işleri gör",
} as const;

/** Kaydırma rayındaki bölüm işaretleri. */
export interface SectionMark {
  readonly id: string;
  readonly label: string;
}

export const SECTION_MARKS: readonly SectionMark[] = [
  { id: "hero", label: "GİRİŞ" },
  { id: "hizmetler", label: "HİZMETLER" },
  { id: "aydinlatma", label: "AYDINLATMA" },
  { id: "aku-secici", label: "AKÜ SEÇİCİ" },
  { id: "teyp-ses", label: "TEYP VE SES" },
  { id: "is-akisi", label: "İŞ AKIŞI" },
  { id: "konum", label: "İLETİŞİM" },
] as const;
