"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CATEGORIES } from "@/lib/types";
import type { Job } from "@/lib/types";
import { isPrivateMediaSrc } from "@/lib/media";
import { saveJobAction, type ActionState } from "@/app/admin/actions";
import { slugify } from "@/lib/validation";

const initialState: ActionState = { ok: false, errors: {} };
const narrativeFields = [
  ["symptom", "Belirti"],
  ["diagnosis", "Teşhis"],
  ["application", "Uygulama"],
  ["result", "Sonuç"],
] as const;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="field-error">
      {message}
    </p>
  );
}

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: form });
  const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!response.ok || !data?.url) throw new Error(data?.error ?? "Yükleme başarısız.");
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
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLInputElement>(null);

  const chooseStatus = (value: "draft" | "published") => {
    // React 19 form-action gönderiminde submitter adı her zaman FormData'ya
    // girmeyebilir; durumu gönderimden önce doğrudan gizli alana yazarız.
    if (statusRef.current) statusRef.current.value = value;
  };

  const busy = pending || uploading;
  const errorKeys = Object.keys(state.errors);

  useEffect(() => {
    if (errorKeys.length === 0) return;
    setDirty(true);
    const first = errorKeys[0];
    const selectorName =
      first === "cover" ? "coverFile" : first === "gallery" ? "galleryFile" : first;
    const field = formRef.current?.querySelector<HTMLElement>(
      `[name="${CSS.escape(selectorName)}"]`,
    );
    field?.focus();
  }, [state.errors]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const onCover = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      setCover(await uploadFile(file));
      setDirty(true);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  };

  const onGallery = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = 12 - gallery.length;
    if (room <= 0) {
      setUploadError("Galeriye en fazla 12 fotoğraf ekleyebilirsiniz.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await Promise.all(Array.from(files).slice(0, room).map(uploadFile));
      setGallery((current) => [...current, ...uploaded].slice(0, 12));
      setDirty(true);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="admin-form"
      onChange={() => setDirty(true)}
      onSubmit={() => setDirty(false)}
    >
      <input type="hidden" name="id" value={job?.id ?? ""} />
      <input
        ref={statusRef}
        type="hidden"
        name="status"
        defaultValue={job?.status ?? "draft"}
      />
      <input type="hidden" name="cover" value={cover} />
      <input type="hidden" name="gallery" value={gallery.join("\n")} />

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__title">İş kaydı</legend>

        <div className="field">
          <label htmlFor="title" className="field-label">
            Başlık
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            autoComplete="off"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={Boolean(state.errors.title)}
            aria-describedby={state.errors.title ? "title-error" : undefined}
            className="field-input"
            placeholder="Akü değişimi ve şarj ölçümü…"
          />
          <FieldError id="title-error" message={state.errors.title} />
        </div>

        <div className="field">
          <label htmlFor="slug" className="field-label">
            Slug (adres)
          </label>
          <div className="field-grid">
            <input
              id="slug"
              name="slug"
              type="text"
              required
              autoComplete="off"
              spellCheck={false}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              aria-invalid={Boolean(state.errors.slug)}
              aria-describedby={state.errors.slug ? "slug-error" : undefined}
              className="field-input"
              placeholder="aku-degisimi…"
            />
            <button
              type="button"
              onClick={() => {
                setSlug(slugify(title));
                setDirty(true);
              }}
              className="button button--secondary"
            >
              Başlıktan üret
            </button>
          </div>
          <FieldError id="slug-error" message={state.errors.slug} />
          <p className="field-hint">
            Yayımlanmış slug değişirse eski adres yeni adrese yönlendirilir.
          </p>
        </div>

        <div className="field-grid">
          <div className="field">
            <label htmlFor="category" className="field-label">
              Kategori
            </label>
            <select
              id="category"
              name="category"
              defaultValue={job?.category ?? CATEGORIES[0]}
              aria-invalid={Boolean(state.errors.category)}
              className="field-input"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <FieldError id="category-error" message={state.errors.category} />
          </div>
          <div className="field">
            <label htmlFor="vehicle" className="field-label">
              Araç bilgisi (isteğe bağlı)
            </label>
            <input
              id="vehicle"
              name="vehicle"
              type="text"
              autoComplete="off"
              defaultValue={job?.vehicle ?? ""}
              className="field-input"
              placeholder="2015 model sedan…"
            />
          </div>
        </div>

        {narrativeFields.map(([name, label]) => (
          <div key={name} className="field">
            <label htmlFor={name} className="field-label">
              {label}
            </label>
            <textarea
              id={name}
              name={name}
              rows={3}
              autoComplete="off"
              defaultValue={job?.[name] ?? ""}
              aria-invalid={Boolean(state.errors[name])}
              aria-describedby={state.errors[name] ? `${name}-error` : undefined}
              className="field-textarea"
              placeholder={`${label} bilgisini açık Türkçeyle yazın…`}
            />
            <FieldError id={`${name}-error`} message={state.errors[name]} />
          </div>
        ))}
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__title">Kapak fotoğrafı</legend>
        <p className="admin-fieldset__intro">
          Yayımlamak için gerçek bir kapak fotoğrafı ve anlamlı alt metin gerekir.
        </p>
        {cover && (
          <div className="image-preview">
            <Image
              src={cover}
              alt="Kapak önizleme"
              fill
              sizes="320px"
              unoptimized={isPrivateMediaSrc(cover)}
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="cover-file" className="field-label">
            Dosya seç (JPEG/PNG/WebP, en fazla 8 MB)
          </label>
          <input
            id="cover-file"
            name="coverFile"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            autoComplete="off"
            onChange={(event) => void onCover(event.target.files?.[0])}
            disabled={uploading}
            className="field-input"
          />
          <p className="field-hint">
            Yükleme bitmeden kayıt yayımlanmaz. Başarısız yüklemede eski kapak korunur.
          </p>
          <FieldError id="cover-error" message={state.errors.cover} />
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__title">Galeri (en fazla 12)</legend>
        {gallery.length > 0 && (
          <ul className="gallery-preview">
            {gallery.map((src) => (
              <li key={src} className="gallery-preview__item">
                <Image
                  src={src}
                  alt="Galeri fotoğrafı"
                  fill
                  sizes="112px"
                  unoptimized={isPrivateMediaSrc(src)}
                />
                <button
                  type="button"
                  aria-label="Fotoğrafı kaldır"
                  onClick={() => {
                    setGallery((current) => current.filter((url) => url !== src));
                    setDirty(true);
                  }}
                  className="gallery-preview__remove"
                >
                  Kaldır
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="field">
          <label htmlFor="gallery-file" className="field-label">
            Fotoğraf ekle
          </label>
          <input
            id="gallery-file"
            name="galleryFile"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            autoComplete="off"
            multiple
            onChange={(event) => void onGallery(event.target.files)}
            disabled={uploading}
            className="field-input"
          />
          <FieldError id="gallery-error" message={state.errors.gallery} />
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__title">Yayın ayrıntıları</legend>
        <div className="field">
          <label htmlFor="alt" className="field-label">
            Fotoğraf alt metni
          </label>
          <input
            id="alt"
            name="alt"
            type="text"
            autoComplete="off"
            defaultValue={job?.alt ?? ""}
            aria-invalid={Boolean(state.errors.alt)}
            aria-describedby={state.errors.alt ? "alt-error" : undefined}
            className="field-input"
            placeholder="Akü kutup başı temizliği…"
          />
          <FieldError id="alt-error" message={state.errors.alt} />
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="sortOrder" className="field-label">
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
              className="field-input"
            />
          </div>
          <div className="field checkbox-field">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              defaultChecked={job?.featured ?? false}
            />
            <label htmlFor="featured">Öne çıkar</label>
          </div>
        </div>
      </fieldset>

      {uploadError && (
        <p role="alert" aria-live="polite" className="form-error">
          {uploadError}
        </p>
      )}
      {state.errors.form && (
        <p role="alert" aria-live="polite" className="form-error">
          {state.errors.form}
        </p>
      )}

      <div className="admin-form__actions">
        <button
          type="submit"
          onClick={() => chooseStatus("draft")}
          disabled={busy}
          className="button button--secondary"
        >
          Taslak kaydet
        </button>
        <button
          type="submit"
          onClick={() => chooseStatus("published")}
          disabled={busy}
          className="button button--primary"
        >
          Yayımla
        </button>
        <a href="/admin" className="button button--secondary">
          Vazgeç
        </a>
      </div>
      <p className="form-status" role="status" aria-live="polite">
        {uploading ? "Fotoğraf yükleniyor…" : pending ? "Kaydediliyor…" : ""}
      </p>
    </form>
  );
}
