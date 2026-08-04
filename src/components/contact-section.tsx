import { profile } from "@/content/profile";
import { CONTAINER, TEXT } from "@/lib/design";
import { cn } from "@/lib/utils";

/**
 * Two links, no form. There is no backend to receive a submission, and a form
 * that silently drops messages is worse than an address someone can copy.
 */
export function ContactSection({ heading, body }: { heading: string; body: string }) {
  return (
    <section
      id="contact"
      className={`${CONTAINER} scroll-mt-20 border-t border-border py-16 sm:py-24`}
    >
      <h2 className="text-title font-semibold">{heading}</h2>
      <p className={cn("mt-6 max-w-[48ch] text-lead", TEXT.subtle)}>{body}</p>

      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
        <a
          href={`mailto:${profile.email}`}
          className="text-lead font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
        >
          {profile.email}
        </a>
        <a
          href={profile.linkedin}
          rel="me noreferrer"
          target="_blank"
          className="text-lead font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
        >
          LinkedIn
        </a>
      </div>
    </section>
  );
}
