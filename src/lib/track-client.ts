/*
 * Client-side beacon.
 *
 * `sendBeacon` survives the page being navigated away from, which a fetch would
 * not. Everything is wrapped in a try/catch because an analytics failure must
 * never surface to a visitor.
 */
export function track(type: string, extra: Record<string, unknown> = {}) {
  try {
    const body = JSON.stringify({
      type,
      path: window.location.pathname,
      locale: document.documentElement.lang,
      ...extra,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/track", { method: "POST", body, keepalive: true });
    }
  } catch {
    // ignored on purpose
  }
}
