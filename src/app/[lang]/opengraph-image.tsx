import { ImageResponse } from "next/og";

import { profile } from "@/content/profile";
import { DEFAULT_LOCALE, isLocale } from "@/lib/locale";

export const alt = profile.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#08080a",
          color: "#fafafa",
          padding: "72px 80px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 20,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#c084fc",
            }}
          />
          {profile.location[lang]}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
              maxWidth: 1000,
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "rgba(255,255,255,0.6)",
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
            width: 56,
            height: 4,
            borderRadius: 999,
            background: "#c084fc",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
