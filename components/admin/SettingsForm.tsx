"use client";

import { useActionState, useState } from "react";
import type { Business } from "@/lib/types";
import { saveBusinessAction, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = { ok: false, errors: {} };
const inputCls =
  "w-full rounded-lg border border-petrol/30 bg-white px-4 py-3 text-graphite placeholder:text-graphite/40";
const labelCls = "mb-1 block font-semibold text-petrol";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-sm font-semibold text-red-800">
      {message}
    </p>
  );
}

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

export default function SettingsForm({ business }: { business: Business }) {
  const [state, formAction, pending] = useActionState(saveBusinessAction, initialState);
  const [services, setServices] = useState<ServiceRow[]>(business.services);
  const [hours, setHours] = useState<HoursRow[]>(business.hours);

  const updateService = (i: number, patch: Partial<ServiceRow>) =>
    setServices((s) => s.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const updateHours = (i: number, patch: Partial<HoursRow>) =>
    setHours((s) => s.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="servicesJson" value={JSON.stringify(services)} />
      <input type="hidden" name="hoursJson" value={JSON.stringify(hours)} />

      <fieldset className="space-y-4 rounded-xl border border-petrol/20 p-4">
        <legend className="px-2 font-display text-2xl font-semibold text-petrol">İşletme</legend>
        <div>
          <label htmlFor="name" className={labelCls}>
            İşletme adı
          </label>
          <input id="name" name="name" type="text" required defaultValue={business.name} className={inputCls} />
          <FieldError message={state.errors.name} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="district" className={labelCls}>
              İlçe / Mahalle
            </label>
            <input id="district" name="district" type="text" defaultValue={business.district} className={inputCls} />
          </div>
          <div>
            <label htmlFor="city" className={labelCls}>
              Şehir
            </label>
            <input id="city" name="city" type="text" defaultValue={business.city} className={inputCls} />
          </div>
        </div>
        <div>
          <label htmlFor="address" className={labelCls}>
            Adres
          </label>
          <input id="address" name="address" type="text" defaultValue={business.address} className={inputCls} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className={labelCls}>
              Telefon (görünen)
            </label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={business.phone} className={inputCls} placeholder="0 (5__) ___ __ __…" />
          </div>
          <div>
            <label htmlFor="phoneHref" className={labelCls}>
              Telefon bağlantısı (tel:)
            </label>
            <input id="phoneHref" name="phoneHref" type="text" defaultValue={business.phoneHref} className={inputCls} placeholder="tel:+90…" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="whatsapp" className={labelCls}>
              WhatsApp bağlantısı (varsa)
            </label>
            <input id="whatsapp" name="whatsapp" type="url" defaultValue={business.whatsapp} className={inputCls} placeholder="https://wa.me/…" />
          </div>
          <div>
            <label htmlFor="email" className={labelCls}>
              E-posta
            </label>
            <input id="email" name="email" type="email" autoComplete="email" spellCheck={false} defaultValue={business.email} className={inputCls} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lat" className={labelCls}>
              Enlem (koordinat)
            </label>
            <input id="lat" name="lat" type="number" inputMode="decimal" step="any" defaultValue={business.lat ?? ""} className={inputCls} placeholder="36.8…" />
          </div>
          <div>
            <label htmlFor="lng" className={labelCls}>
              Boylam (koordinat)
            </label>
            <input id="lng" name="lng" type="number" inputMode="decimal" step="any" defaultValue={business.lng ?? ""} className={inputCls} placeholder="34.6…" />
          </div>
        </div>
        <div>
          <label htmlFor="mapsUrl" className={labelCls}>
            Harita bağlantısı (yoksa koordinattan üretilir)
          </label>
          <input id="mapsUrl" name="mapsUrl" type="url" defaultValue={business.mapsUrl} className={inputCls} placeholder="https://www.google.com/maps/…" />
        </div>
        <div>
          <label htmlFor="profileUrl" className={labelCls}>
            Google İşletme Profili bağlantısı
          </label>
          <input id="profileUrl" name="profileUrl" type="url" defaultValue={business.profileUrl} className={inputCls} placeholder="https://g.page/…" />
        </div>
        <label htmlFor="verified" className="flex items-center gap-2 font-semibold text-petrol">
          <input id="verified" name="verified" type="checkbox" defaultChecked={business.verified} className="h-5 w-5 accent-[#102A2A]" />
          Bilgiler doğrulandı (üretimde yalnızca doğrulanmış bilgi gösterilir)
        </label>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-petrol/20 p-4">
        <legend className="px-2 font-display text-2xl font-semibold text-petrol">Hero metni</legend>
        <div>
          <label htmlFor="heroTitle" className={labelCls}>
            Başlık
          </label>
          <input id="heroTitle" name="heroTitle" type="text" required defaultValue={business.heroTitle} className={inputCls} />
          <FieldError message={state.errors.heroTitle} />
        </div>
        <div>
          <label htmlFor="heroSubtitle" className={labelCls}>
            Açıklama
          </label>
          <textarea id="heroSubtitle" name="heroSubtitle" rows={3} required defaultValue={business.heroSubtitle} className={inputCls} />
          <FieldError message={state.errors.heroSubtitle} />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-petrol/20 p-4">
        <legend className="px-2 font-display text-2xl font-semibold text-petrol">Çalışma saatleri</legend>
        {hours.length === 0 && (
          <p className="text-sm text-graphite/70">
            Saat girilmezse sitede açık/kapalı etiketi gösterilmez.
          </p>
        )}
        {hours.map((h, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-4">
            <input
              aria-label="Gün"
              type="text"
              value={h.day}
              onChange={(e) => updateHours(i, { day: e.target.value })}
              className={inputCls}
              placeholder="Pazartesi"
            />
            <input
              aria-label="Açılış"
              type="text"
              value={h.open}
              onChange={(e) => updateHours(i, { open: e.target.value })}
              className={inputCls}
              placeholder="09:00"
            />
            <input
              aria-label="Kapanış"
              type="text"
              value={h.close}
              onChange={(e) => updateHours(i, { close: e.target.value })}
              className={inputCls}
              placeholder="18:00"
            />
            <button
              type="button"
              onClick={() => setHours((s) => s.filter((_, idx) => idx !== i))}
              className="rounded-lg border-2 border-petrol/25 px-4 font-bold text-petrol hover:border-petrol"
            >
              Kaldır
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setHours((s) => [...s, { day: "", open: "", close: "" }])}
          className="rounded-full border-2 border-petrol px-5 py-2 font-bold text-petrol hover:bg-petrol hover:text-paper"
        >
          Saat ekle
        </button>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-petrol/20 p-4">
        <legend className="px-2 font-display text-2xl font-semibold text-petrol">Hizmetler</legend>
        <p className="text-sm text-graphite/70">
          Yalnızca “onaylı” işaretli hizmetler üretimde yayımlanır.
        </p>
        {services.map((s, i) => (
          <div key={s.id} className="space-y-2 rounded-lg border border-petrol/15 p-3">
            <input
              aria-label="Hizmet başlığı"
              type="text"
              value={s.title}
              onChange={(e) => updateService(i, { title: e.target.value })}
              className={inputCls}
              placeholder="Hizmet başlığı"
            />
            <textarea
              aria-label="Belirti"
              rows={2}
              value={s.symptom}
              onChange={(e) => updateService(i, { symptom: e.target.value })}
              className={inputCls}
              placeholder="Müşterinin yaşadığı belirti…"
            />
            <textarea
              aria-label="Sunulan hizmet"
              rows={2}
              value={s.service}
              onChange={(e) => updateService(i, { service: e.target.value })}
              className={inputCls}
              placeholder="İşletmenin sunduğu hizmet…"
            />
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 font-semibold text-petrol">
                <input
                  type="checkbox"
                  checked={s.approved}
                  onChange={(e) => updateService(i, { approved: e.target.checked })}
                  className="h-5 w-5 accent-[#102A2A]"
                />
                Onaylı
              </label>
              <button
                type="button"
                onClick={() => setServices((arr) => arr.filter((_, idx) => idx !== i))}
                className="rounded-lg border-2 border-petrol/25 px-4 py-1.5 text-sm font-bold text-petrol hover:border-petrol"
              >
                Kaldır
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setServices((arr) => [
              ...arr,
              { id: `hizmet-${Date.now().toString(36)}`, title: "", symptom: "", service: "", approved: false },
            ])
          }
          className="rounded-full border-2 border-petrol px-5 py-2 font-bold text-petrol hover:bg-petrol hover:text-paper"
        >
          Hizmet ekle
        </button>
      </fieldset>

      {state.errors.form && (
        <p role="alert" className="rounded-lg border border-red-700/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {state.errors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-lime px-6 py-3.5 font-bold text-petrol transition-colors hover:bg-lime-deep disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
