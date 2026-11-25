import Image from "next/image";
import Link from "next/link";
import type { Job } from "@/lib/types";
import ExampleBadge from "./ExampleBadge";

export default function JobCard({ job, priority = false }: { job: Job; priority?: boolean }) {
  const src = job.cover || "/placeholder-is.svg";
  return (
    <article className="group">
      <Link href={`/yapilan-isler/${job.slug}`} className="block" aria-label={`${job.title} — detay`}>
        <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-paper-2">
          <Image
            src={src}
            alt={job.alt || job.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {job.isExample && (
            <span className="absolute left-3 top-3">
              <ExampleBadge label="Örnek kayıt" />
            </span>
          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-petrol/60">{job.category}</p>
            <h3 className="balance font-display text-2xl font-semibold leading-tight text-petrol group-hover:underline group-hover:underline-offset-4">
              {job.title}
            </h3>
            {job.vehicle && <p className="mt-1 text-sm text-graphite/70">{job.vehicle}</p>}
          </div>
          <span aria-hidden="true" className="mt-1 shrink-0 font-display text-2xl text-petrol/40">
            →
          </span>
        </div>
      </Link>
    </article>
  );
}
