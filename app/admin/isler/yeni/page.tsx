import JobForm from "@/components/admin/JobForm";

export default function NewJobPage() {
  return (
    <div>
      <h1 className="admin-title">Yeni iş ekle</h1>
      <p className="admin-subtitle">
        Taslak kaydedebilir veya kapak fotoğrafı yükleyip doğrudan yayımlayabilirsin.
      </p>
      <JobForm />
    </div>
  );
}
