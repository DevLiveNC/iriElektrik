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
      <h1 className="admin-title">İşletme ayarları</h1>
      <p className="admin-subtitle">
        Public site bu tek kaynaktan beslenir. Eksik veya doğrulanmamış bilgi ve bağlantı
        gösterilmez.
      </p>
      <Toast message={ok} />
      <SettingsForm business={business} />
    </div>
  );
}
