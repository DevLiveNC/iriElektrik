/**
 * İşletme sahibinin doldurması gereken alanların işaret listesi.
 *
 * Bu işaretler veri katmanında tutulur; public arayüzde doğrudan gösterilmez,
 * yalnızca `OWNER-CHECKLIST.md` ve owner-only notlar üzerinden görünür.
 * Asla örnek adres, numara veya saat ile doldurulmaz.
 */

export interface OwnerField {
  /** Veri katmanındaki alan adı. */
  readonly key: string;
  /** Yönetim panelindeki etiket. */
  readonly label: string;
  /** Ekranda görünecek tutarlı işaret. */
  readonly marker: string;
  /** Nerede doldurulacağı. */
  readonly where: string;
}

export const OWNER_FIELD_MARKER = "[SAHİP DOLDURACAK]";

export const OWNER_FIELDS: readonly OwnerField[] = [
  {
    key: "address",
    label: "Açık adres",
    marker: "[SAHİP DOLDURACAK: açık adres]",
    where: "/admin/ayarlar → İşletme bilgileri → Adres",
  },
  {
    key: "district",
    label: "İlçe / mahalle",
    marker: "[SAHİP DOLDURACAK: ilçe / mahalle]",
    where: "/admin/ayarlar → İşletme bilgileri → İlçe / Mahalle",
  },
  {
    key: "city",
    label: "Şehir",
    marker: "[SAHİP DOLDURACAK: şehir]",
    where: "/admin/ayarlar → İşletme bilgileri → Şehir",
  },
  {
    key: "region",
    label: "Ülke / hizmet bölgesi",
    marker: "[SAHİP DOLDURACAK: ülke / hizmet bölgesi]",
    where: "/admin/ayarlar → İşletme bilgileri (bölge alanı doğrulanmadan hiçbir yerde yazılmaz)",
  },
  {
    key: "phone",
    label: "Telefon ve tel: bağlantısı",
    marker: "[SAHİP DOLDURACAK: telefon, görünen yazım ve tel:+… bağlantısı]",
    where: "/admin/ayarlar → Telefon (görünen) + Telefon bağlantısı",
  },
  {
    key: "whatsapp",
    label: "WhatsApp bağlantısı",
    marker: "[SAHİP DOLDURACAK: WhatsApp bağlantısı, https://wa.me/…]",
    where: "/admin/ayarlar → WhatsApp bağlantısı",
  },
  {
    key: "email",
    label: "E-posta",
    marker: "[SAHİP DOLDURACAK: e-posta]",
    where: "/admin/ayarlar → E-posta",
  },
  {
    key: "hours",
    label: "Çalışma saatleri",
    marker: "[SAHİP DOLDURACAK: çalışma saatleri, gün gün]",
    where: "/admin/ayarlar → Çalışma saatleri",
  },
  {
    key: "mapsUrl",
    label: "Yol tarifi hedefi",
    marker: "[SAHİP DOLDURACAK: Google Haritalar yol tarifi URL veya enlem/boylam]",
    where: "/admin/ayarlar → Enlem / Boylam veya Doğrulanmış yol tarifi URL’si",
  },
  {
    key: "profileUrl",
    label: "Google İşletme Profili",
    marker: "[SAHİP DOLDURACAK: Google İşletme Profili URL]",
    where: "/admin/ayarlar → Google İşletme Profili",
  },
  {
    key: "heroPhoto",
    label: "Onaylı hero fotoğrafı",
    marker: "[SAHİP DOLDURACAK: onaylı hero ve hizmet fotoğrafları + alt metin; plaka ve yüz yok]",
    where: "/admin/ayarlar → Onaylı atölye fotoğrafı",
  },
  {
    key: "batteryFinder",
    label: "Akü seçici veri seti",
    marker: "[SAHİP DOLDURACAK: akü seçici gerçek araç/akü satırları]",
    where: "data/battery-finder.ts → batteryFinderEntries (source: \"owner\")",
  },
] as const;

/** Public arayüzde owner-only not olarak kullanılan cümle. */
export const OWNER_NOTE = "Bu alan işletme tarafından henüz girilmedi.";
