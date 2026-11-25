import Image from "next/image";
import Link from "next/link";
import type { Job } from "@/lib/types";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" });

export default function JobCard({ job }: { job: Job }) {
  const href = `/yapilan-isler/${job.slug}`;
  return (
    <article className="archive-item">
      <div className="archive-item__media">
        <Image
          src={job.cover}
          alt={job.alt}
          width={960}
          height={640}
          sizes="(min-width: 961px) 24rem, (min-width: 621px) 18rem, 100vw"
          loading="lazy"
          className="archive-item__image"
        />
      </div>
      <div className="archive-item__body">
        <p className="archive-item__meta">
          {job.category} · {dateFmt.format(new Date(job.updatedAt))}
        </p>
        <h2>
          <Link href={href} className="archive-item__title">
            {job.title}
          </Link>
        </h2>
        {job.vehicle && <p className="archive-item__meta">{job.vehicle}</p>}
        <Link href={href} className="text-link archive-item__link">
          İşi incele
        </Link>
      </div>
    </article>
  );
}
