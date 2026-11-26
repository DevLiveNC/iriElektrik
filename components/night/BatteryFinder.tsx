"use client";

import { useMemo, useState } from "react";
import {
  buildWhatsAppMessage,
  findMatch,
  listMakes,
  listModels,
  listYears,
  type VehicleBatteryEntry,
} from "@/data/battery-finder";

interface Props {
  entries: VehicleBatteryEntry[];
  whatsappHref: string;
  phoneHref: string;
  phoneLabel: string;
  /** Boş listede gösterilecek resmî cümle. */
  emptyText: string;
  /** Eşleşme bulunduğunda gösterilecek uyarı cümlesi. */
  referenceNote: string;
  /** Telefon/WhatsApp yoksa gösterilecek iletişim cümlesi. */
  contactFallback: string;
  ownerNote: string;
}

export default function BatteryFinder({
  entries,
  whatsappHref,
  phoneHref,
  phoneLabel,
  emptyText,
  referenceNote,
  contactFallback,
  ownerNote,
}: Props) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const ownerEntries = useMemo(() => entries.filter((entry) => entry.source === "owner"), [entries]);
  const makes = useMemo(() => listMakes(ownerEntries), [ownerEntries]);
  const models = useMemo(
    () => (make ? listModels(ownerEntries, make) : []),
    [ownerEntries, make],
  );
  const years = useMemo(
    () => (make && model ? listYears(ownerEntries, make, model) : []),
    [ownerEntries, make, model],
  );

  const match = useMemo(() => {
    if (!make || !model || !year) return null;
    return findMatch(ownerEntries, make, model, Number(year));
  }, [ownerEntries, make, model, year]);

  const hasEntries = ownerEntries.length > 0;
  const yearValue = year ? Number(year) : 0;
  const whatsappUrl = whatsappHref
    ? `${whatsappHref}${whatsappHref.includes("?") ? "&" : "?"}text=${encodeURIComponent(
        buildWhatsAppMessage(make, model, yearValue),
      )}`
    : "";

  return (
    <div className="finder">
      <div className="finder__row">
        <div className="finder__field">
          <label className="finder__label" htmlFor="finder-make">
            Marka
          </label>
          <select
            id="finder-make"
            className="finder__select"
            value={make}
            disabled={!hasEntries}
            onChange={(event) => {
              setMake(event.target.value);
              setModel("");
              setYear("");
            }}
          >
            <option value="">{hasEntries ? "Marka seçin" : "Henüz liste yok"}</option>
            {makes.map((option) => (
              <option key={option.make} value={option.make}>
                {option.make}
              </option>
            ))}
          </select>
        </div>

        <div className="finder__field">
          <label className="finder__label" htmlFor="finder-model">
            Model
          </label>
          <select
            id="finder-model"
            className="finder__select"
            value={model}
            disabled={!make || models.length === 0}
            onChange={(event) => {
              setModel(event.target.value);
              setYear("");
            }}
          >
            <option value="">{make ? "Model seçin" : "Önce marka seçin"}</option>
            {models.map((option) => (
              <option key={option.model} value={option.model}>
                {option.model}
              </option>
            ))}
          </select>
        </div>

        <div className="finder__field">
          <label className="finder__label" htmlFor="finder-year">
            Yıl
          </label>
          <select
            id="finder-year"
            className="finder__select"
            value={year}
            disabled={!make || !model || years.length === 0}
            onChange={(event) => setYear(event.target.value)}
          >
            <option value="">{make && model ? "Yıl seçin" : "Önce model seçin"}</option>
            {years.map((option) => (
              <option key={option.year} value={option.year}>
                {option.year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!hasEntries ? (
        <div className="finder__empty">
          <p>{emptyText}</p>
          <span className="owner-note">{ownerNote}</span>
          <div className="finder__actions">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                data-event="whatsapp"
                className="button button--primary"
              >
                WhatsApp
              </a>
            ) : null}
            {phoneHref ? (
              <a href={phoneHref} data-event="ara" className="button button--metal">
                Hemen ara
                {phoneLabel ? ` — ${phoneLabel}` : ""}
              </a>
            ) : null}
            {!whatsappHref && !phoneHref ? (
              <p className="finder__note">{contactFallback}</p>
            ) : null}
          </div>
        </div>
      ) : match ? (
        <div className="finder__result">
          <h3 className="finder__result-title">
            {match.yearFrom === match.yearTo
              ? `${match.yearFrom} ${match.make} ${match.model}`
              : `${match.yearFrom}–${match.yearTo} ${match.make} ${match.model}`}
          </h3>
          <p className="finder__result-row">
            {match.groupSize ? (
              <span>
                Akü grubu: <strong>{match.groupSize}</strong>
              </span>
            ) : null}
            {match.notes ? <span>{match.notes}</span> : null}
          </p>
          <p className="finder__note">{referenceNote}</p>
          <div className="finder__actions">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                data-event="whatsapp"
                className="button button--primary"
              >
                WhatsApp
              </a>
            ) : null}
            {phoneHref ? (
              <a href={phoneHref} data-event="ara" className="button button--metal">
                Hemen ara
                {phoneLabel ? ` — ${phoneLabel}` : ""}
              </a>
            ) : null}
            {!whatsappUrl && !phoneHref ? (
              <p className="finder__note">{contactFallback}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="finder__empty">
          <p>
            Bu aracı için henüz bir akü referansı girilmemiş. Marka, model ve yılı iletirsen
            ölçümle doğru aküyü birlikte netleştirelim.
          </p>
          <div className="finder__actions">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                data-event="whatsapp"
                className="button button--primary"
              >
                WhatsApp
              </a>
            ) : null}
            {phoneHref ? (
              <a href={phoneHref} data-event="ara" className="button button--metal">
                Hemen ara
                {phoneLabel ? ` — ${phoneLabel}` : ""}
              </a>
            ) : null}
            {!whatsappHref && !phoneHref ? (
              <p className="finder__note">{contactFallback}</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
