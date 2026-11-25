"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { CATEGORIES, STATUS_LABELS } from "@/lib/types";
import type { Job } from "@/lib/types";
import { saveJobAction, type ActionState } from "@/app/admin/actions";
import { slugify } from "@/lib/validation";

const initialState: ActionState = { ok: false, errors: {} };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-sm font-semibold text-red-800">
      {message}
    </p>
  );
}

const inputCls =
  "w-full rounded-lg border border-petrol/30 bg-white px-4 py-3 text-graphite placeholder:text-graphite/40";
const labelCls = "mb-1 block font-semibold text-petrol";

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!res.ok || !data?.url) throw new Error(data?.error ?? "Yükleme başarısız.");
  return data.url;
}

export default function JobForm({ job }: { job?: Job }) {
  const [state, formAction, pending] = useActionState(saveJobAction, initialState);
  const [title, setTitle] = useState(job?.title ?? "");
  const [slug, setSlug] = useState(job?.slug ?? "");
  const [cover, setCover] = useState(job?.cover ?? "");
  const [gallery, setGallery] = useState<string[]>(job?.gallery ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const busy = pending || uploading;

  const onCover = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      setCover(await uploadFile(file));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  };

  const onGallery = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setUploadError(null);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await uploadFile(f));
      setGallery((g) => [...g, ...urls].slice(0, 12));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={job?.id ?? ""} />
      <input type="hidden" name="cover" value={cover} />
      <input type="hidden" name="gallery" value={gallery.join("\n")} />

      <div>
        <label htmlFor="title" className={labelCls}>
          Başlık
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          autoComplete="off"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
          placeholder="Örn. Akü değişimi ve şarj ölçümü…"
        />
        <FieldError message={state.errors.title} />
      </div>

      <div>
        <label htmlFor="slug" className={labelCls}>
          Slug (adres)
        </label>
        <div className="flex gap-2">
          <input
            id="slug"
            name="slug"
            type="text"
            required
            autoComplete="off"
            spellCheck={false}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={inputCls}
            placeholder="aku-degisimi…"
          />
          <button
            type="button"
            onClick={() => setSlug(slugify(title))}
            className="shrink-0 rounded-lg border-2 border-petrol/25 px-4 font-bold text-petrol hover:border-petrol"
          >
            Başlıktan üret
          </button>
        </div>
        <FieldError message={state.errors.slug} />
        <p className="mt-1 text-sm text-graphite/70">
          Yayımlanmış slug sabit tutulur; değişirsen eski adres yeni adrese yönlendirilir.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelCls}>
            Kategori
          </label>
          <select id="category" name="category" defaultValue={job?.category ?? CATEGORIES[0]} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError message={state.errors.category} />
        </div>
        <div>
          <label htmlFor="vehicle" className={labelCls}>
            Araç bilgisi (isteğe bağlı)
          </label>
          <input
            id="vehicle"
            name="vehicle"
            type="text"
            autoComplete="off"
            defaultValue={job?.vehicle ?? ""}
            className={inputCls}
            placeholder="Örn. 2015 model sedan…"
          />
        </div>
      </div>

      {(
        [
          ["symptom", "Belirti"],
          ["diagnosis", "Teşhis"],
          ["application", "Uygulama"],
          ["result", "Sonuç"],
        ] as const
      ).map(([name, label]) => (
        <div key={name}>
          <label htmlFor={name} className={labelCls}>
            {label}
          </label>
          <textarea
            id={name}
            name={name}
            rows={3}
            defaultValue={job?.[name] ?? ""}
            className={inputCls}
            placeholder={`${label} bilgisini açık Türkçeyle yazın…`}
          />
          <FieldError message={state.errors[name]} />
        </div>
      ))}

      <fieldset className="rounded-xl border border-petrol/20 p-4">
        <legend className="px-2 font-semibold text-petrol">Kapak fotoğrafı</legend>
        {cover && (
          <div className="relative mb-3 h-40 w-64 overflow-hidden rounded-lg bg-paper-2">
            <Image src={cover} alt="Kapak önizleme" fill sizes="256px" className="object-cover" />
          </div>
        )}
        <label htmlFor="cover-file" className={labelCls}>
          Dosya seç (JPEG/PNG/WebP, en fazla 8 MB)
        </label>
        <input
          id="cover-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => void onCover(e.target.files?.[0])}
          disabled={uploading}
          className="block w-full rounded-lg border border-petrol/30 bg-white px-4 py-3"
        />
        <p className="mt-1 text-sm text-graphite/70">
          Yükleme bitmeden kayıt yayımlanmaz. Başarısız yüklemede eski kapak korunur.
        </p>
      </fieldset>

      <fieldset className="rounded-xl border border-petrol/20 p-4">
        <legend className="px-2 font-semibold text-petrol">Galeri (en fazla 12)</legend>
        {gallery.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-2">
            {gallery.map((src) => (
              <li key={src} className="relative h-20 w-28 overflow-hidden rounded-lg bg-paper-2">
                <Image src={src} alt="Galeri fotoğrafı" fill sizes="112px" className="object-cover" />
                <button
                  type="button"
                  aria-label="Fotoğrafı kaldır"
                  onClick={() => setGallery((g) => g.filter((u) => u !== src))}
                  className="absolute right-1 top-1 rounded-full bg-petrol px-2 py-0.5 text-xs font-bold text-lime"
                >
                  Kaldır
                </button>
              </li>
            ))}
          </ul>
        )}
        <label htmlFor="gallery-file" className={labelCls}>
          Fotoğraf ekle
        </label>
        <input
          id="gallery-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => void onGallery(e.target.files)}
          disabled={uploading}
          className="block w-full rounded-lg border border-petrol/30 bg-white px-4 py-3"
        />
      </fieldset>

      <div>
        <label htmlFor="alt" className={labelCls}>
          Fotoğraf alt metni
        </label>
        <input
          id="alt"
          name="alt"
          type="text"
          autoComplete="off"
          defaultValue={job?.alt ?? ""}
          className={inputCls}
          placeholder="Örn. Akü kutup başı temizliği…"
        />
        <FieldError message={state.errors.alt} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="status" className={labelCls}>
            Durum
          </label>
          <select id="status" name="status" defaultValue={job?.status ?? "draft"} className={inputCls}>
            {(Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <FieldError message={state.errors.status} />
        </div>
        <div>
          <label htmlFor="sortOrder" className={labelCls}>
            Sıralama
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            inputMode="numeric"
            min={0}
            max={9999}
            defaultValue={job?.sortOrder ?? 0}
            className={inputCls}
          />
        </div>
        <div className="flex items-end pb-1">
          <label htmlFor="featured" className="flex items-center gap-2 font-semibold text-petrol">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              defaultChecked={job?.featured ?? false}
              className="h-5 w-5 accent-[#102A2A]"
            />
            Öne çıkar
          </label>
        </div>
      </div>

      {uploadError && (
        <p role="alert" className="rounded-lg border border-red-700/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {uploadError}
        </p>
      )}
      {state.errors.form && (
        <p role="alert" className="rounded-lg border border-red-700/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {state.errors.form}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 rounded-full bg-lime px-6 py-3.5 font-bold text-petrol transition-colors hover:bg-lime-deep disabled:opacity-60"
        >
          {pending ? "Kaydediliyor…" : uploading ? "Fotoğraf yükleniyor…" : "Kaydet"}
        </button>
        <a
          href="/admin"
          className="flex-1 rounded-full border-2 border-petrol/25 px-6 py-3.5 text-center font-bold text-petrol hover:border-petrol"
        >
          Vazgeç
        </a>
      </div>
    </form>
  );
}
