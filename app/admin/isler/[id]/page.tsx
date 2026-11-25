import { notFound } from "next/navigation";
import JobForm from "@/components/admin/JobForm";
import { getJobById } from "@/lib/store";

export default async function EditJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hata?: string }>;
}) {
  const { id } = await params;
  const { hata } = await searchParams;
  const [job] = await Promise.all([getJobById(id)]);
  if (!job) notFound();

  return (
    <div>
      <h1 className="admin-title">İşi düzenle</h1>
      {hata && (
        <p role="alert" className="form-error">
          {hata}
        </p>
      )}
      <JobForm job={job} />
    </div>
  );
}
