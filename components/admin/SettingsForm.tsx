"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Business } from "@/lib/types";
import { isPrivateMediaSrc } from "@/lib/media";
import { saveBusinessAction, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = { ok: false, errors: {} };

interface ServiceRow {
  id: string;
  title: string;
  symptom: string;
  service: string;
  approved: boolean;
}

interface HoursRow {
  day: string;
  open: string;
  close: string;
}

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

export default function SettingsForm({ business }: { business: Business }) {
  const [state, formAction, pending] = useActionState(saveBusinessAction, initialState);
  const [services, setServices] = useState<ServiceRow[]>(business.services);
  const [hours, setHours] = useState<HoursRow[]>(business.hours);
  const [heroImage, setHeroImage] = useState(business.heroImage);
  const [heroImageAlt, setHeroImageAlt] = useState(business.heroImageAlt);
  const [heroPhotoApproved, setHeroPhotoApproved] = useState(business.heroPhotoApproved);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const busy = pending || uploading;
  const errorKeys = Object.keys(state.errors);

  useEffect(() => {
    if (errorKeys.length === 0) return;
    setDirty(true);
    const selectorMap: Record<string, string> = {
      heroImage: "heroPhotoFile",
      services: "service-title-0",
      hours: "hour-day-0",
    };
    const selectorName = selectorMap[errorKeys[0]] ?? errorKeys[0];
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

  const updateService = (index: number, patch: Partial<ServiceRow>) =>
    setServices((rows) =>
      rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );

  const updateHours = (index: number, patch: Partial<HoursRow>) =>
    setHours((rows) =>
      rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );

  const onHeroPhoto = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      setHeroImage(await uploadFile(file));
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
      <input type="hidden" name="servicesJson" value={JSON.stringify(services)} />
      <input type="hidden" name="hoursJson" value={JSON.stringify(hours)} />
      <input type="hidden" name="heroImage" value={heroImage} />

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__title">İşletme bilgileri</legend>
        <p className="admin-fieldset__intro">
          “Bilgiler doğrulandı” işaretlenmeden adres, telefon, bölge ve saatler üretimde görünmez.
        </p>
        <div className="field">
          <label htmlFor="name" className="field-label">
            İşletme adı
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="organization"
            defaultValue={business.name}
            aria-invalid={Boolean(state.errors.name)}
            className="field-input"
          />
          <FieldError id="name-error" message={state.errors.name} />
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="district" className="field-label">
              İlçe / Mahalle
            </label>
            <input
              id="district"
              name="district"
              type="text"
              autoComplete="off"
              defaultValue={business.district}
              className="field-input"
            />
          </div>
          <div className="field">
            <label htmlFor="city" className="field-label">
              Şehir
            </label>
            <input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              defaultValue={business.city}
              className="field-input"
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="address" className="field-label">
            Adres
          </label>
          <input
            id="address"
            name="address"
            type="text"
            autoComplete="street-address"
            defaultValue={business.address}
            className="field-input"
          />
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="phone" className="field-label">
              Telefon (görünen)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={business.phone}
              className="field-input"
              placeholder="0 (5__) ___ __ __…"
            />
          </div>
          <div className="field">
            <label htmlFor="phoneHref" className="field-label">
              Telefon bağlantısı
            </label>
            <input
              id="phoneHref"
              name="phoneHref"
              type="text"
              inputMode="tel"
              autoComplete="off"
              spellCheck={false}
              defaultValue={business.phoneHref}
              aria-invalid={Boolean(state.errors.phoneHref)}
              className="field-input"
              placeholder="tel:+90…"
            />
            <FieldError id="phoneHref-error" message={state.errors.phoneHref} />
          </div>
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="whatsapp" className="field-label">
              WhatsApp bağlantısı (varsa)
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="url"
              autoComplete="off"
              spellCheck={false}
              defaultValue={business.whatsapp}
              className="field-input"
              placeholder="https://wa.me/…"
            />
          </div>
          <div className="field">
            <label htmlFor="email" className="field-label">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              defaultValue={business.email}
              className="field-input"
            />
          </div>
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="lat" className="field-label">
              Enlem
            </label>
            <input
              id="lat"
              name="lat"
              type="number"
              inputMode="decimal"
              step="any"
              autoComplete="off"
              defaultValue={business.lat ?? ""}
              className="field-input"
              placeholder="36.8…"
            />
          </div>
          <div className="field">
            <label htmlFor="lng" className="field-label">
              Boylam
            </label>
            <input
              id="lng"
              name="lng"
              type="number"
              inputMode="decimal"
              step="any"
              autoComplete="off"
              defaultValue={business.lng ?? ""}
              className="field-input"
              placeholder="34.6…"
            />
          </div>
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="mapsUrl" className="field-label">
              Doğrulanmış yol tarifi URL’si
            </label>
            <input
              id="mapsUrl"
              name="mapsUrl"
              type="url"
              autoComplete="off"
              spellCheck={false}
              defaultValue={business.mapsUrl}
              className="field-input"
              placeholder="https://www.google.com/maps/dir/?api=1&destination=…"
            />
            <p className="field-hint">
              Koordinat varsa doğrudan yol tarifi onlardan üretilir.
            </p>
            <FieldError id="mapsUrl-error" message={state.errors.mapsUrl} />
          </div>
          <div className="field">
            <label htmlFor="profileUrl" className="field-label">
              Google İşletme Profili
            </label>
            <input
              id="profileUrl"
              name="profileUrl"
              type="url"
              autoComplete="off"
              spellCheck={false}
              defaultValue={business.profileUrl}
              className="field-input"
              placeholder="https://g.page/…"
            />
          </div>
        </div>
        <label htmlFor="verified" className="checkbox-field">
          <input id="verified" name="verified" type="checkbox" defaultChecked={business.verified} />
          Bilgiler doğrulandı
        </label>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__title">Hero metni</legend>
        <div className="field">
          <label htmlFor="heroTitle" className="field-label">
            Başlık
          </label>
          <input
            id="heroTitle"
            name="heroTitle"
            type="text"
            required
            autoComplete="off"
            defaultValue={business.heroTitle}
            aria-invalid={Boolean(state.errors.heroTitle)}
            className="field-input"
          />
          <FieldError id="heroTitle-error" message={state.errors.heroTitle} />
        </div>
        <div className="field">
          <label htmlFor="heroSubtitle" className="field-label">
            Açıklama
          </label>
          <textarea
            id="heroSubtitle"
            name="heroSubtitle"
            rows={3}
            required
            autoComplete="off"
            defaultValue={business.heroSubtitle}
            aria-invalid={Boolean(state.errors.heroSubtitle)}
            className="field-textarea"
          />
          <FieldError id="heroSubtitle-error" message={state.errors.heroSubtitle} />
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__title">Onaylı atölye fotoğrafı</legend>
        <p className="admin-fieldset__intro">
          Temsili tasarım görseli üretimde kullanılamaz. Yalnızca müşteri izni alınmış gerçek
          fotoğrafı yükleyip onaylayın.
        </p>
        {heroImage && (
          <div className="image-preview">
            <Image
              src={heroImage}
              alt={heroImageAlt || "Atölye fotoğrafı önizleme"}
              fill
              sizes="320px"
              unoptimized={isPrivateMediaSrc(heroImage)}
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="hero-photo-file" className="field-label">
            Fotoğraf yükle (JPEG/PNG/WebP, en fazla 8 MB)
          </label>
          <input
            id="hero-photo-file"
            name="heroPhotoFile"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            autoComplete="off"
            onChange={(event) => void onHeroPhoto(event.target.files?.[0])}
            disabled={uploading}
            className="field-input"
          />
          <FieldError id="heroImage-error" message={state.errors.heroImage} />
        </div>
        <div className="field">
          <label htmlFor="heroImageAlt" className="field-label">
            Fotoğraf alt metni
          </label>
          <input
            id="heroImageAlt"
            name="heroImageAlt"
            type="text"
            autoComplete="off"
            value={heroImageAlt}
            onChange={(event) => setHeroImageAlt(event.target.value)}
            aria-invalid={Boolean(state.errors.heroImageAlt)}
            className="field-input"
            placeholder="Açık kaput altında akü ölçümü…"
          />
          <FieldError id="heroImageAlt-error" message={state.errors.heroImageAlt} />
        </div>
        <label htmlFor="heroPhotoApproved" className="checkbox-field">
          <input
            id="heroPhotoApproved"
            name="heroPhotoApproved"
            type="checkbox"
            checked={heroPhotoApproved}
            onChange={(event) => setHeroPhotoApproved(event.target.checked)}
          />
          Fotoğraf onaylandı ve üretimde gösterilebilir
        </label>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__title">Çalışma saatleri</legend>
        <p className="admin-fieldset__intro">
          Boş bırakılırsa sitede saat listesi veya açık/kapalı etiketi gösterilmez.
        </p>
        {hours.map((hour, index) => (
          <div key={index} className="hours-editor">
            <div className="hours-editor__row">
              <div className="field">
                <label className="sr-only" htmlFor={`hour-day-${index}`}>
                  Gün
                </label>
                <input
                  id={`hour-day-${index}`}
                  name={`hour-day-${index}`}
                  type="text"
                  autoComplete="off"
                  value={hour.day}
                  onChange={(event) => updateHours(index, { day: event.target.value })}
                  className="field-input"
                  placeholder="Pazartesi…"
                />
              </div>
              <div className="field">
                <label className="sr-only" htmlFor={`hour-open-${index}`}>
                  Açılış
                </label>
                <input
                  id={`hour-open-${index}`}
                  name={`hour-open-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={hour.open}
                  onChange={(event) => updateHours(index, { open: event.target.value })}
                  className="field-input"
                  placeholder="09:00…"
                />
              </div>
              <div className="field">
                <label className="sr-only" htmlFor={`hour-close-${index}`}>
                  Kapanış
                </label>
                <input
                  id={`hour-close-${index}`}
                  name={`hour-close-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={hour.close}
                  onChange={(event) => updateHours(index, { close: event.target.value })}
                  className="field-input"
                  placeholder="18:00…"
                />
              </div>
              <button
                type="button"
                onClick={() => setHours((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
                className="admin-action"
              >
                Kaldır
              </button>
            </div>
          </div>
        ))}
        <FieldError id="hours-error" message={state.errors.hours} />
        <button
          type="button"
          onClick={() => setHours((rows) => [...rows, { day: "", open: "", close: "" }])}
          className="button button--secondary button--small"
        >
          Saat ekle
        </button>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__title">Hizmetler</legend>
        <p className="admin-fieldset__intro">
          Yalnızca onaylı işaretli hizmetler public listede ve menüde görünür.
        </p>
        {services.map((service, index) => (
          <div key={service.id} className="service-editor">
            <div className="service-editor__row">
              <div className="field">
                <label className="sr-only" htmlFor={`service-title-${index}`}>
                  Hizmet başlığı
                </label>
                <input
                  id={`service-title-${index}`}
                  name={`service-title-${index}`}
                  type="text"
                  autoComplete="off"
                  value={service.title}
                  onChange={(event) => updateService(index, { title: event.target.value })}
                  className="field-input"
                  placeholder="Hizmet başlığı…"
                />
              </div>
              <div className="field">
                <label className="sr-only" htmlFor={`service-symptom-${index}`}>
                  Belirti
                </label>
                <textarea
                  id={`service-symptom-${index}`}
                  name={`service-symptom-${index}`}
                  rows={2}
                  autoComplete="off"
                  value={service.symptom}
                  onChange={(event) => updateService(index, { symptom: event.target.value })}
                  className="field-textarea"
                  placeholder="Müşterinin yaşadığı belirti…"
                />
              </div>
              <div className="field">
                <label className="sr-only" htmlFor={`service-work-${index}`}>
                  Sunulan hizmet
                </label>
                <textarea
                  id={`service-work-${index}`}
                  name={`service-work-${index}`}
                  rows={2}
                  autoComplete="off"
                  value={service.service}
                  onChange={(event) => updateService(index, { service: event.target.value })}
                  className="field-textarea"
                  placeholder="İşletmenin sunduğu hizmet…"
                />
              </div>
              <div className="service-editor__footer">
                <label className="checkbox-field" htmlFor={`service-approved-${index}`}>
                  <input
                    id={`service-approved-${index}`}
                    name={`service-approved-${index}`}
                    type="checkbox"
                    checked={service.approved}
                    onChange={(event) => updateService(index, { approved: event.target.checked })}
                  />
                  Onaylı
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setServices((rows) => rows.filter((_, rowIndex) => rowIndex !== index))
                  }
                  className="admin-action"
                >
                  Kaldır
                </button>
              </div>
            </div>
          </div>
        ))}
        <FieldError id="services-error" message={state.errors.services} />
        <button
          type="button"
          onClick={() =>
            setServices((rows) => [
              ...rows,
              {
                id: `hizmet-${Date.now().toString(36)}`,
                title: "",
                symptom: "",
                service: "",
                approved: false,
              },
            ])
          }
          className="button button--secondary button--small"
        >
          Hizmet ekle
        </button>
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
        <button type="submit" disabled={busy} className="button button--primary">
          Ayarları kaydet
        </button>
      </div>
      <p className="form-status" role="status" aria-live="polite">
        {uploading ? "Fotoğraf yükleniyor…" : pending ? "Kaydediliyor…" : ""}
      </p>
    </form>
  );
}
