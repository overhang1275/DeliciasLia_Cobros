export const APP_TIME_ZONE = "America/Mexico_City";

process.env.TZ ||= APP_TIME_ZONE;

export function appDateFormatter(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-MX", { timeZone: APP_TIME_ZONE, ...options });
}

export function dateInputValue(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { day: "2-digit", month: "2-digit", timeZone: APP_TIME_ZONE, year: "numeric" }).format(date);
}

export function parseDateInput(value: unknown, fallback = new Date(), endOfDay = false) {
  const date = typeof value === "string" && value ? new Date(`${value}T00:00:00`) : new Date(fallback);
  if (Number.isNaN(date.getTime())) return fallback;
  date.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  return date;
}

export function todayRange() {
  const inicio = parseDateInput(dateInputValue());
  const fin = parseDateInput(dateInputValue(), inicio, true);
  return { gte: inicio, lte: fin };
}
