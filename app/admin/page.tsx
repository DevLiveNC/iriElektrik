import Image from "next/image";
import Link from "next/link";
import { isPrivateMediaSrc } from "@/lib/media";
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
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Yapılan işler</h1>
          <p className="admin-subtitle">
            Taslaklar, yayındaki kayıtlar ve arşiv tek listede görünür. Yayın durumu her satırda
            metinle belirtilir.
          </p>
        </div>
        <Link href="/admin/isler/yeni" className="button button--primary">
          Yeni iş ekle
        </Link>
      </div>
      <Toast message={ok} />

      {jobs.length === 0 ? (
        <p className="admin-empty">
          Henüz iş kaydı yok. “Yeni iş ekle” ile ilk kaydı oluşturun.
        </p>
      ) : (
        <ul className="admin-list">
          {jobs.map((job, index) => (
            <li key={job.id} className="admin-row">
              <div className={`admin-thumb ${job.cover ? "" : "admin-thumb--empty"}`}>
                {job.cover ? (
                  <Image
                    src={job.cover}
                    alt={job.alt || "Kapak fotoğrafı önizlemesi"}
                    width={220}
                    height={150}
                    sizes="110px"
                    loading="lazy"
                    unoptimized={isPrivateMediaSrc(job.cover)}
                  />
                ) : (
                  "Fotoğraf yok"
                )}
              </div>
              <div className="admin-row__main">
                <div className="admin-row__status">
                  <span className={`status-text status-text--${job.status}`}>
                    {STATUS_LABELS[job.status]}
                  </span>
                  {job.featured && <span className="status-text">Öne çıkan</span>}
                </div>
                <Link href={`/admin/isler/${job.id}`} className="admin-row__title">
                  {job.title}
                </Link>
                <p className="admin-row__meta">
                  {job.category} · {dateFmt.format(new Date(job.updatedAt))}
                </p>
              </div>
              <div className="admin-row__actions">
                <Link href={`/admin/onizleme/${job.id}`} className="admin-action">
                  Önizle
                </Link>
                <Link href={`/admin/isler/${job.id}`} className="admin-action">
                  Düzenle
                </Link>
                {job.status !== "published" ? (
                  <form action={setStatusAction.bind(null, job.id, "published")}>
                    <button type="submit" className="admin-action admin-action--primary">
                      Yayımla
                    </button>
                  </form>
                ) : (
                  <form action={setStatusAction.bind(null, job.id, "draft")}>
                    <button type="submit" className="admin-action">
                      Yayından kaldır
                    </button>
                  </form>
                )}
                {job.status !== "archived" && (
                  <form action={setStatusAction.bind(null, job.id, "archived")}>
                    <button type="submit" className="admin-action">
                      Arşivle
                    </button>
                  </form>
                )}
                <form action={toggleFeaturedAction.bind(null, job.id)}>
                  <button type="submit" className="admin-action">
                    {job.featured ? "Öne çıkarma kaldır" : "Öne çıkar"}
                  </button>
                </form>
                <form action={moveJobAction.bind(null, job.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="Yukarı taşı"
                    className="admin-action"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveJobAction.bind(null, job.id, "down")}>
                  <button
                    type="submit"
                    disabled={index === jobs.length - 1}
                    aria-label="Aşağı taşı"
                    className="admin-action"
                  >
                    ↓
                  </button>
                </form>
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
