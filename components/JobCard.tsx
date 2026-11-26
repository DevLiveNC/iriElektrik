import Image from "next/image";
import Link from "next/link";
import type { Job } from "@/lib/types";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" });

export default function JobCard({ job }: { job: Job }) {
  const href = `/yapilan-isler/${job.slug}`;
  return (
    <article className="archive-item" data-gsap-item>
      <Link href={href} className="archive-item__media" tabIndex={-1} aria-hidden="true">
        <Image
          src={job.cover}
          alt={job.alt}
          width={960}
          height={640}
          sizes="(min-width: 961px) 22rem, (min-width: 621px) 16rem, 100vw"
          loading="lazy"
          className="archive-item__image"
        />
      </Link>
      <div className="archive-item__body">
        <p className="archive-item__meta tabular">
          <span className="archive-item__badge">{job.category}</span>
          <span>{dateFmt.format(new Date(job.updatedAt))}</span>
          {job.vehicle && <span>· {job.vehicle}</span>}
        </p>
        <h2>
          <Link href={href} className="archive-item__title">
            {job.title}
          </Link>
        </h2>
        <p className="archive-item__excerpt">{job.result}</p>
        <Link href={href} className="text-link archive-item__link">
          İşi incele →
        </Link>
      </div>
    </article>
  );
}
