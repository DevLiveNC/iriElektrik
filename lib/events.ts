export const EVENT_NAMES = ["ara", "yol_tarifi", "whatsapp"] as const;
export type EventName = (typeof EVENT_NAMES)[number];
