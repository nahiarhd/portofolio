/**
 * Maps portfolio projects into the 3D shelf book model.
 * Single source: `src/content/projects.ts` — same data as Work and chat.
 */

import { projects, type Project } from "@/content/projects";
import type { Locale } from "@/lib/locale";
import { resolvePublicMedia } from "@/lib/public-media";

/** Black clothbound. Varied just enough to tell six spines apart. */
const CLOTH = [
  "#141418",
  "#17171c",
  "#1c1c21",
  "#121216",
  "#1f1f25",
  "#19191e",
] as const;

/** Violet foil on black cloth — the secondary colour, stamped not painted. */
const FOIL = [
  "#c084fc",
  "#a78bfa",
  "#d8b4fe",
  "#c4b5fd",
  "#b794f6",
  "#e9d5ff",
] as const;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"] as const;

export type ShelfBook = {
  id: string;
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  binding: string;
  paper: string;
  extent: string;
  motif: string;
  width: number;
  height: number;
  thickness: number;
  clothColor: string;
  foilColor: string;
  coverImage?: string;
  pages: { title: string; text: string }[];
};

function dims(project: Project, index: number) {
  // Slight size variety so the shelf does not look like one stamp.
  const t = 0.26 + (index % 3) * 0.04 + (project.confidential ? 0.04 : 0);
  return {
    width: 1.42 + (index % 4) * 0.05,
    height: 2.05 + (index % 3) * 0.08,
    thickness: Math.min(t, 0.42),
  };
}

export function shelfBooksForLocale(
  lang: Locale,
  labels: {
    problem: string;
    role: string;
    outcome: string;
    stack: string;
  },
): ShelfBook[] {
  return projects.map((project, index) => {
    const size = dims(project, index);
    return {
      id: project.slug,
      slug: project.slug,
      number: `Volume ${ROMAN[index] ?? index + 1}`,
      title: project.title[lang],
      subtitle: project.summary[lang],
      description: project.summary[lang],
      binding: project.confidential ? "NDA clothbound" : "Open clothbound",
      paper: project.stack.slice(0, 2).join(" / ") || "Typescript",
      extent: `${project.stack.length} tools`,
      motif: project.pillar,
      ...size,
      clothColor: CLOTH[index % CLOTH.length]!,
      foilColor: FOIL[index % FOIL.length]!,
      coverImage: resolvePublicMedia(project.coverImage),
      pages: [
        {
          title: project.title[lang],
          text: `${project.summary[lang]}\n\n${project.stack.join(" · ")}`,
        },
        { title: labels.problem, text: project.problem[lang] },
        { title: labels.role, text: project.role[lang] },
        { title: labels.outcome, text: project.outcome[lang] },
        {
          title: labels.stack,
          text: project.stack.join("\n"),
        },
      ],
    };
  });
}
