import { TEXT } from "@/lib/design";
import { cn } from "@/lib/utils";

/**
 * Placeholder. T3 moves this under `app/[lang]/`, T8 builds the real hero.
 * Deliberately minimal — no invented content stands in for content that has
 * not been written yet.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-3 px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Raihan Hidayatullah Djunaedi
      </h1>
      <p className={cn("text-sm", TEXT.subtle)}>Developer by Passion, Data by Precision.</p>
    </main>
  );
}
