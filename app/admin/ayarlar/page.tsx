import SettingsForm from "@/components/admin/SettingsForm";
import Toast from "@/components/admin/Toast";
import { getBusiness } from "@/lib/store";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const business = await getBusiness();
  return (
    <div>
      <h1 className="font-display text-5xl font-bold text-petrol">İşletme ayarları</h1>
      <p className="mt-2 text-graphite/80">
        Tüm sayfalar bu tek kaynaktan beslenir. Doğrulanmamış bilgiler üretimde gösterilmez.
      </p>
      <div className="mt-4 max-w-2xl">
        <Toast message={ok} />
      </div>
      <div className="mt-6 max-w-2xl">
        <SettingsForm business={business} />
      </div>
    </div>
  );
}
