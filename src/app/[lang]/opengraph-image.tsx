import { ImageResponse } from "next/og";

import { profile } from "@/content/profile";
import { DEFAULT_LOCALE, isLocale } from "@/lib/locale";

export const alt = profile.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Editorial OG card — cool ground + indigo accent, matching the site tokens.
 * No photos, no employer branding.
 */
export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : DEFAULT_LOCALE;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f6f7f9",
          color: "#101319",
          padding: "72px 80px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#565e70",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {profile.location[lang]}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#565e70",
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            {profile.tagline[lang]}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: 48,
            height: 4,
            background: "#26346e",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
