import { notFound } from "next/navigation";

import { profile } from "@/content/profile";
import { TEXT } from "@/lib/design";
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

  return (
    <main
      id="content"
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-3 px-6"
    >
      <h1 className="text-3xl font-semibold tracking-tight">{profile.name}</h1>
      <p className={cn("text-sm", TEXT.subtle)}>{profile.tagline[lang]}</p>
      <p className={cn("text-sm", TEXT.faint)}>{profile.location[lang]}</p>
    </main>
  );
}
