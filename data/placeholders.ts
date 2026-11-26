/**
 * Tasarım önizlemesi için hazırlanmış temsili görseller.
 *
 * Bu dosya public arayüzde hiçbir zaman “atölyenin fotoğrafı” olarak sunulmaz:
 * her kullanımda “Temsili görsel, atölyenin kendi fotoğrafı değildir.” notu ile
 * etiketlenir ve `DESIGN_PREVIEW` kapalıyken tamamen gizlenir.
 *
 * `ownerMarker` alanları, işletmenin gerçek fotoğrafını yükleyene kadar durumun
 * görünür kalması içindir.
 */

export type PlaceholderId =
  | "hero-bay-16x9"
  | "hero-bay-4x5"
  | "aku-macro-3x2"
  | "tesisat-loom-3x2"
  | "teyp-dash-16x9"
  | "ses-door-3x2"
  | "lamba-once-16x9"
  | "lamba-sonra-16x9"
  | "banko-alet-16x9";

export interface PlaceholderImage {
  readonly id: PlaceholderId;
  /** public/ altındaki yol. */
  readonly src: string;
  /** Türkçe alt metin (görsel gerçek atölye fotoğrafı değildir). */
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  /** Görselin yanında görünen açıklama. */
  readonly caption: string;
  /** İşletmenin doldurması gereken alan işareti. */
  readonly ownerMarker: string;
  /** Fotoğraf yönlendirme notu (üretim sürecinde referans). */
  readonly brief: string;
}

const CAPTION = "Temsili görsel, atölyenin kendi fotoğrafı değildir.";

export const PLACEHOLDER_IMAGES: Record<PlaceholderId, PlaceholderImage> = {
  "hero-bay-16x9": {
    id: "hero-bay-16x9",
    src: "/design-preview/hero-bay-16x9.jpg",
    alt: "Gece servis bölmesi: önüne bakan bir otomobilin kısa farları yeni yanıyor, ıslak asfalt ve yanında açık kaputun üzerinde turuncu bir çalışma lambası.",
    width: 2400,
    height: 1350,
    caption: CAPTION,
    ownerMarker: "[SAHİP DOLDURACAK: onaylı hero fotoğrafı + alt metin; plaka ve yüz yok]",
    brief:
      "Gece servis bölmesi, kameraya bakan bir yolcu aracı, yeni yanan kısa farlar, ıslak koyu asfalt, yanda açık kaput üzerinde sıcak tungsten çalışma lambası. Okunabilir plaka, yüz veya marka logosu yok.",
  },
  "hero-bay-4x5": {
    id: "hero-bay-4x5",
    src: "/design-preview/hero-bay-4x5.jpg",
    alt: "Aynı gece sahnesinin dikey kırpımı: farlar ve ön kaput baskın, üstte tipografi için boşluk bırakılmış.",
    width: 1080,
    height: 1350,
    caption: CAPTION,
    ownerMarker: "[SAHİP DOLDURACAK: onaylı hero fotoğrafı + alt metin; plaka ve yüz yok]",
    brief:
      "Aynı sahnenin mobil kırpımı; farlar ve kaput baskın, üstte tipografi için boş alan. Okunabilir plaka, yüz veya marka logosu yok.",
  },
  "aku-macro-3x2": {
    id: "aku-macro-3x2",
    src: "/design-preview/aku-macro-3x2.jpg",
    alt: "Motor bölmesinde bir akünün bakır kutuçuklarına temas eden multimetre probu ile ölçümü, sığ odak derinliğinde.",
    width: 1800,
    height: 1200,
    caption: CAPTION,
    ownerMarker: "[SAHİP DOLDURACAK: akü ölçümü fotoğrafı + alt metin; plaka ve yüz yok]",
    brief:
      "Motor bölgesinde akü makro karesi: bakır kutuçuklar, multimetre probu, sığ odak derinliği, çalışma lambası rengi. Okunabilir marka etiketi yok.",
  },
  "tesisat-loom-3x2": {
    id: "tesisat-loom-3x2",
    src: "/design-preview/tesisat-loom-3x2.jpg",
    alt: "Banko üzerinde temiz kablo demeti ve yalıtılmış konnektörler, grafit zemin üzerinde dokümantar çekim.",
    width: 1800,
    height: 1200,
    caption: CAPTION,
    ownerMarker: "[SAHİP DOLDURACAK: tesisat fotoğrafı + alt metin; plaka ve yüz yok]",
    brief:
      "Banko üzerinde temiz kablo demeti ve yalıtılmış konnektörler, grafit zemin, dokümantar; gülümseyen teknisyen klişesi yok.",
  },
  "teyp-dash-16x9": {
    id: "teyp-dash-16x9",
    src: "/design-preview/teyp-dash-16x9.jpg",
    alt: "Teyp ünitesi montajından sonra torpido: ekran karanlık, sade trim ve düzenli bir panel.",
    width: 2400,
    height: 1350,
    caption: CAPTION,
    ownerMarker: "[SAHİP DOLDURACAK: teyp montajı fotoğrafı + alt metin; plaka ve yüz yok]",
    brief:
      "Teyp montajı sonrası torpido; ekran karanlık veya nötr bir saat gösteriyor, düzenli fasya, tedarikçi logosu yok.",
  },
  "ses-door-3x2": {
    id: "ses-door-3x2",
    src: "/design-preview/ses-door-3x2.jpg",
    alt: "Sökülmüş kapı döşemesi ve yerleştirilen hoparlör; bakır ve siyah metaller, doğal çalışma lambası ışığı.",
    width: 1800,
    height: 1200,
    caption: CAPTION,
    ownerMarker: "[SAHİP DOLDURACAK: ses sistemi montajı fotoğrafı + alt metin; plaka ve yüz yok]",
    brief:
      "Kısmen sökülmüş kapı döşemesi, yerleştirilen hoparlör, bakır ve siyah metaller, doğal çalışma lambası ışığı.",
  },
  "lamba-once-16x9": {
    id: "lamba-once-16x9",
    src: "/design-preview/lamba-once-16x9.jpg",
    alt: "Gece, aynı araç ve aynı kamera açısı: soluk ve eşit olmayan, dim farlar.",
    width: 2400,
    height: 1350,
    caption: CAPTION,
    ownerMarker:
      "[SAHİP DOLDURACAK: aydınlatma karşılaştırması için aynı kadrajdan fotoğraf çifti + alt metin]",
    brief:
      "Aynı araç, aynı kamera, gece; soluk ve eşit olmayan farlar. Karşılaştırma çiftinin “sonra” karesiyle birebir aynı kadrajda olmalı.",
  },
  "lamba-sonra-16x9": {
    id: "lamba-sonra-16x9",
    src: "/design-preview/lamba-sonra-16x9.jpg",
    alt: "Gece, aynı araç ve aynı kamera açısı: asfalt üzerinde dengeli ve doğru ayarlanmış far huzmeleri.",
    width: 2400,
    height: 1350,
    caption: CAPTION,
    ownerMarker:
      "[SAHİP DOLDURACAK: aydınlatma karşılaştırması için aynı kadrajdan fotoğraf çifti + alt metin]",
    brief:
      "Aynı araç, aynı kamera, gece; asfalt üzerinde dengeli ve doğru ayarlanmış far huzmeleri. “Önce” karesiyle birebir aynı kadrajda olmalı.",
  },
  "banko-alet-16x9": {
    id: "banko-alet-16x9",
    src: "/design-preview/banko-alet-16x9.jpg",
    alt: "Çalışma bankosu: multimetre, yalıtılmış aletler ve bir lamba ünitesi; fiyat etiketi veya markalı ambalaj yok.",
    width: 2400,
    height: 1350,
    caption: CAPTION,
    ownerMarker: "[SAHİP DOLDURACAK: banko ve ölçüm aleti fotoğrafı + alt metin; plaka ve yüz yok]",
    brief:
      "Çalışma bankosu: multimetre, yalıtılmış aletler, bir lamba ünitesi. Fiyat, etiket veya ticari marka ambalajı yok.",
  },
};

export const PLACEHOLDER_LIST: readonly PlaceholderImage[] = Object.values(PLACEHOLDER_IMAGES);

/**
 * Hizmet bayları için temsili görsel eşlemesi.
 * Yeni hizmet eklenirse kaydı buraya da eklenmelidir.
 */
export const SERVICE_PLACEHOLDER: Record<string, PlaceholderId> = {
  "aku-sarj": "aku-macro-3x2",
  "mars-alternator": "banko-alet-16x9",
  aydinlatma: "lamba-once-16x9",
  "tesisat-ariza": "tesisat-loom-3x2",
  "teyp-multimedia": "teyp-dash-16x9",
  "ses-sistemi": "ses-door-3x2",
};
