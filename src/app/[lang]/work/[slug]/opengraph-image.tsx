import { ImageResponse } from "next/og";

import { projects } from "@/content/projects";
import { profile } from "@/content/profile";
import { DEFAULT_LOCALE, isLocale } from "@/lib/locale";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  const lang = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const project = projects.find((entry) => entry.slug === slug);

  const title = project?.title[lang] ?? profile.name;
  const summary = project?.summary[lang] ?? profile.tagline[lang];
  const pillar = project?.pillar?.toUpperCase() ?? "WORK";

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
            fontSize: 20,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#c084fc",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {pillar} · {profile.name}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              fontSize: 52,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "rgba(255,255,255,0.6)",
              maxWidth: 960,
              lineHeight: 1.4,
            }}
          >
            {summary}
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
