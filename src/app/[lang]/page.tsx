import { notFound } from "next/navigation";

import { profile } from "@/content/profile";
import { CONTAINER, EYEBROW, TEXT } from "@/lib/design";
import { isLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

/**
 * Placeholder hero. T8 builds the real one; T13 drops the graph into it without
 * changing the layout. Deliberately minimal — invented copy standing in for
 * copy that has not been written is worse than obviously missing copy.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  // `flex-1`, not `min-h-screen`: the body is already a column with a header and
  // footer, so a full-viewport main pushes the footer off the screen.
  return (
    <main id="content" className={`${CONTAINER} flex flex-1 flex-col justify-center py-20`}>
      <p className={cn(EYEBROW, "mb-6")}>{profile.location[lang]}</p>
      <h1 className="max-w-[14ch] text-display font-semibold">{profile.name}</h1>
      <p className={cn("mt-6 max-w-[46ch] text-lead", TEXT.subtle)}>
        {profile.tagline[lang]}
      </p>
    </main>
  );
}
