import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found">
      <h1 className="not-found__title">Sayfa bulunamadı</h1>
      <p className="not-found__text">
        Aradığın adres taşınmış veya hiç var olmamış olabilir.
      </p>
      <Link href="/" className="button button--primary not-found__action">
        Ana sayfaya dön
      </Link>
    </section>
  );
}
