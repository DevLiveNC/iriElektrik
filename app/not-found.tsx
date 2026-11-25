import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-6xl font-bold text-petrol">Sayfa bulunamadı</h1>
      <p className="mt-4 text-lg text-graphite/85">
        Aradığın adres taşınmış veya hiç var olmamış olabilir.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-lime px-8 py-3.5 font-bold text-petrol transition-colors hover:bg-lime-deep"
      >
        Ana sayfaya dön
      </Link>
    </section>
  );
}
