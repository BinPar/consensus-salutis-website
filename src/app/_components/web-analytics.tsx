"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/* Paths carrying secrets: access tokens and private report slugs. */
const REDACTED_PATHS: [RegExp, string][] = [
  [/^\/espacio\/acceso\/[^/]+/, "/espacio/acceso/[token]"],
  [/^\/informe\/(?!preview\/)[^/]+/, "/informe/[slug]"],
];

function redact(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url);
  // Query may hold `?enlace=` and similar; never useful in analytics.
  url.search = "";
  for (const [pattern, replacement] of REDACTED_PATHS) {
    url.pathname = url.pathname.replace(pattern, replacement);
  }
  return { ...event, url: url.toString() };
}

export function WebAnalytics() {
  return <Analytics beforeSend={redact} />;
}
