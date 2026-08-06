import { profile } from "@/content/profile";
import { CONTAINER } from "@/lib/design";

/**
 * Typographic beat between the work and the chat.
 *
 * The line is `profile.tagline`, split on its comma rather than retyped here,
 * so there is one copy of it in the repo. Solid over outlined echoes the hero
 * headline; `.drift` moves it against the page as the section passes.
 */
export function Statement() {
  const [first, ...rest] = profile.tagline.en.split(",");
  const second = rest.join(",").trim();

  return (
    <section
      data-anim="statement"
      /* Full viewport height so the type sits centred while ScrollTrigger
       * holds the section pinned, rather than riding the top third. */
      className="flex min-h-[100dvh] items-center overflow-clip border-t border-border py-24"
    >
      <div className={CONTAINER}>
        <p className="font-display text-display font-medium leading-[0.98] tracking-[-0.05em]">
          <span data-anim="statement-line" className="block">
            {first},
          </span>
          <span data-anim="statement-line" className="text-outline block pb-2">
            {second}.
          </span>
        </p>
      </div>
    </section>
  );
}
