import JobForm from "@/components/admin/JobForm";

export default function NewJobPage() {
  return (
    <div>
      <h1 className="font-display text-5xl font-bold text-petrol">Yeni iş ekle</h1>
      <p className="mt-2 text-graphite/80">Önce taslak kaydedin; fotoğraflar yüklendikten sonra yayımlayın.</p>
      <div className="mt-6 max-w-2xl">
        <JobForm />
      </div>
    </div>
  );
}
