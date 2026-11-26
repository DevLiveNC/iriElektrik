/**
 * Akü seçici veri seti.
 *
 * Bu dizi production'da BOŞ gönderilir: uydurma araç satırı, stok, fiyat veya
 * marka bilgisi gösterilmez. Kullanıcı aracı girene kadar arayüz boş durum
 * metnini gösterir.
 *
 * `source` alanı iki değer alır:
 *  - "owner" : işletmenin girdiği gerçek satır (public arayüzde kullanılır)
 *  - "example" : yalnızca yerel geliştirme için örnek satır (public arayüzde
 *                filtrelenir; DESIGN_PREVIEW=1 dışında hiçbir yerde görünmez)
 */

export type BatteryEntrySource = "owner" | "example";

export interface VehicleBatteryEntry {
  readonly id: string;
  /** İşletmenin girdiği marka. */
  readonly make: string;
  /** İşletmenin girdiği model. */
  readonly model: string;
  readonly yearFrom: number;
  readonly yearTo: number;
  /** İsteğe bağlı akü grubu (ör. "L2"). */
  readonly groupSize?: string;
  /** İsteğe bağlı, asla fiyat içermeyen not. */
  readonly notes?: string;
  readonly source: BatteryEntrySource;
}

/**
 * Production bu diziyi boş bırakır.
 * Örnek satırlar eklenirse `source: "example"` olmalı ve public arayüzde
 * filtrelenmelidir.
 */
export const batteryFinderEntries: VehicleBatteryEntry[] = [];

export interface BatteryMakeOption {
  readonly make: string;
  readonly count: number;
}

export interface BatteryModelOption {
  readonly make: string;
  readonly model: string;
}

export interface BatteryYearOption {
  readonly year: number;
}

/** Üretimde kullanılabilen satırlar (yalnızca işletme kayıtları). */
export function getOwnerEntries(
  entries: readonly VehicleBatteryEntry[] = batteryFinderEntries,
): VehicleBatteryEntry[] {
  return entries.filter((entry) => entry.source === "owner");
}

export function listMakes(entries: readonly VehicleBatteryEntry[]): BatteryMakeOption[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.make, (counts.get(entry.make) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([make, count]) => ({ make, count }))
    .sort((a, b) => a.make.localeCompare(b.make, "tr"));
}

export function listModels(
  entries: readonly VehicleBatteryEntry[],
  make: string,
): BatteryModelOption[] {
  const models = new Set<string>();
  for (const entry of entries) {
    if (entry.make === make) models.add(entry.model);
  }
  return [...models]
    .sort((a, b) => a.localeCompare(b, "tr"))
    .map((model) => ({ make, model }));
}

export function listYears(
  entries: readonly VehicleBatteryEntry[],
  make: string,
  model: string,
): BatteryYearOption[] {
  const years = new Set<number>();
  for (const entry of entries) {
    if (entry.make !== make || entry.model !== model) continue;
    for (let year = entry.yearFrom; year <= entry.yearTo; year += 1) years.add(year);
  }
  return [...years].sort((a, b) => b - a).map((year) => ({ year }));
}

export function findMatch(
  entries: readonly VehicleBatteryEntry[],
  make: string,
  model: string,
  year: number,
): VehicleBatteryEntry | null {
  return (
    entries.find(
      (entry) =>
        entry.make === make &&
        entry.model === model &&
        year >= entry.yearFrom &&
        year <= entry.yearTo,
    ) ?? null
  );
}

/** WhatsApp ön dolgu metni — şablon birebir korunur. */
export function buildWhatsAppMessage(make: string, model: string, year: number): string {
  return `Merhaba, ${year} ${make} ${model} için akü hakkında bilgi almak istiyorum.`;
}
