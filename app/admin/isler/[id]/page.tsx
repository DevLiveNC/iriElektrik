import { notFound } from "next/navigation";
import JobForm from "@/components/admin/JobForm";
import Toast from "@/components/admin/Toast";
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
  const job = await getJobById(id);
  if (!job) notFound();

  return (
    <div>
      <h1 className="font-display text-5xl font-bold text-petrol">İşi düzenle</h1>
      {hata && (
        <div className="mt-4 max-w-2xl">
          <p role="alert" className="rounded-lg border border-red-700/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {hata}
          </p>
        </div>
      )}
      <div className="mt-6 max-w-2xl">
        <JobForm job={job} />
      </div>
      <div className="mt-4 max-w-2xl">
        <Toast message={undefined} />
      </div>
    </div>
  );
}
