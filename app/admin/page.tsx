import Image from "next/image";
import Link from "next/link";
import Toast from "@/components/admin/Toast";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { listJobs } from "@/lib/store";
import { STATUS_LABELS } from "@/lib/types";
import {
  deleteJobAction,
  moveJobAction,
  setStatusAction,
  toggleFeaturedAction,
} from "./actions";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" });

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const jobs = await listJobs();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-5xl font-bold text-petrol">Yapılan işler</h1>
        <Link
          href="/admin/isler/yeni"
          className="rounded-full bg-lime px-6 py-3 font-bold text-petrol transition-colors hover:bg-lime-deep"
        >
          Yeni iş ekle
        </Link>
      </div>
      <div className="mt-4">
        <Toast message={ok} />
      </div>

      {jobs.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-petrol/30 bg-paper-2 px-6 py-10 text-center text-graphite/80">
          Henüz iş kaydı yok. “Yeni iş ekle” ile ilk kaydı oluşturun.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-petrol/15 border-y border-petrol/15">
          {jobs.map((job, i) => (
            <li key={job.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-paper-2">
                <Image
                  src={job.cover || "/placeholder-is.svg"}
                  alt={job.alt || job.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      job.status === "published"
                        ? "bg-lime text-petrol"
                        : job.status === "draft"
                          ? "bg-paper-2 text-petrol"
                          : "bg-graphite text-paper"
                    }`}
                  >
                    {STATUS_LABELS[job.status]}
                  </span>
                  {job.featured && (
                    <span className="rounded-full bg-petrol px-2.5 py-0.5 text-xs font-bold text-lime">
                      Öne çıkan
                    </span>
                  )}
                  {job.isExample && (
                    <span className="rounded-full border border-dashed border-petrol/40 px-2.5 py-0.5 text-xs font-semibold text-petrol">
                      Örnek
                    </span>
                  )}
                </p>
                <Link
                  href={`/admin/isler/${job.id}`}
                  className="mt-1 block truncate font-display text-2xl font-semibold text-petrol hover:underline hover:underline-offset-4"
                >
                  {job.title}
                </Link>
                <p className="tabular text-sm text-graphite/70">
                  {job.category} · {dateFmt.format(new Date(job.updatedAt))}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/onizleme/${job.id}`}
                  className="rounded-full px-4 py-2 text-sm font-bold text-petrol underline underline-offset-4"
                >
                  Önizle
                </Link>
                <Link
                  href={`/admin/isler/${job.id}`}
                  className="rounded-full border-2 border-petrol px-4 py-2 text-sm font-bold text-petrol hover:bg-petrol hover:text-paper"
                >
                  Düzenle
                </Link>
                {job.status !== "published" ? (
                  <form action={setStatusAction.bind(null, job.id, "published")}>
                    <button
                      type="submit"
                      className="rounded-full bg-lime px-4 py-2 text-sm font-bold text-petrol hover:bg-lime-deep"
                    >
                      Yayımla
                    </button>
                  </form>
                ) : (
                  <form action={setStatusAction.bind(null, job.id, "draft")}>
                    <button
                      type="submit"
                      className="rounded-full border-2 border-petrol/25 px-4 py-2 text-sm font-bold text-petrol hover:border-petrol"
                    >
                      Yayından kaldır
                    </button>
                  </form>
                )}
                {job.status !== "archived" && (
                  <form action={setStatusAction.bind(null, job.id, "archived")}>
                    <button
                      type="submit"
                      className="rounded-full border-2 border-petrol/25 px-4 py-2 text-sm font-bold text-petrol hover:border-petrol"
                    >
                      Arşivle
                    </button>
                  </form>
                )}
                <form action={toggleFeaturedAction.bind(null, job.id)}>
                  <button
                    type="submit"
                    className="rounded-full border-2 border-petrol/25 px-4 py-2 text-sm font-bold text-petrol hover:border-petrol"
                  >
                    {job.featured ? "Öne çıkarma kaldır" : "Öne çıkar"}
                  </button>
                </form>
                <span className="flex items-center gap-1">
                  <form action={moveJobAction.bind(null, job.id, "up")}>
                    <button
                      type="submit"
                      disabled={i === 0}
                      aria-label="Yukarı taşı"
                      className="rounded-lg border border-petrol/25 px-2.5 py-2 text-sm font-bold text-petrol disabled:opacity-40"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveJobAction.bind(null, job.id, "down")}>
                    <button
                      type="submit"
                      disabled={i === jobs.length - 1}
                      aria-label="Aşağı taşı"
                      className="rounded-lg border border-petrol/25 px-2.5 py-2 text-sm font-bold text-petrol disabled:opacity-40"
                    >
                      ↓
                    </button>
                  </form>
                </span>
                <ConfirmButton
                  label="Sil"
                  confirmTitle="İşi sil"
                  confirmText={`“${job.title}” kaydı kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
                  action={deleteJobAction.bind(null, job.id)}
                  danger
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
