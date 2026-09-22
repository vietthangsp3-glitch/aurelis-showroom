export type AnalyticsEvent =
  | "view_vehicle"
  | "search_vehicle"
  | "filter_vehicle"
  | "compare_vehicle"
  | "finance_calculation"
  | "lead_open"
  | "lead_submit"
  | "test_drive_request";

export function track(event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("aurelia:analytics", { detail: { event, properties } }));
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  dataLayer?.push({ event, ...properties });
}
