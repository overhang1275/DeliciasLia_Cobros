import { appDateFormatter } from "./timezone";

export const moneyFormatter = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
export const percentFormatter = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1, style: "percent" });

export const mediumDateFormatter = appDateFormatter({ dateStyle: "medium" });
export const shortDateTimeFormatter = appDateFormatter({ dateStyle: "medium", timeStyle: "short" });
export const fullDateFormatter = appDateFormatter({ dateStyle: "full" });
export const timeFormatter = appDateFormatter({ hour: "2-digit", minute: "2-digit" });
export const shortDayFormatter = appDateFormatter({ day: "2-digit", month: "short" });
export const dayMonthYearFormatter = appDateFormatter({ day: "2-digit", month: "short", year: "numeric" });

export function formatMoney(value: number | string | { valueOf(): unknown }) {
  return moneyFormatter.format(Number(value));
}

export function formatPercent(value: number, total: number) {
  return total > 0 ? percentFormatter.format(value / total) : "0%";
}

export function formatTicketId(id: number) {
  return String(id).padStart(6, "0");
}
