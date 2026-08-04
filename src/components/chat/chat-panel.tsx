"use client";

/**
 * Portfolio chat panel. Closed by default — the site must work without it.
 *
 * Reads AI SDK v7 APIs from installed docs: `useChat` + `DefaultChatTransport`,
 * messages via `parts`, status for loading, `error` for failures. Locale rides
 * in the transport body so the route can answer in EN or ID.
 */

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { Button } from "@/components/ui/button";
import { useGraphActivity } from "@/components/graph/activity";
import { SURFACE, TEXT } from "@/lib/design";
import type { ShowProjectOutput } from "@/lib/chat-tools";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { ProjectCard } from "./project-card";

type ChatCopy = Dictionary["chat"];
type WorkCopy = Dictionary["work"];

const SUGGESTION_KEYS = ["ai", "blockchain", "background"] as const;

function isShowProjectOutput(value: unknown): value is ShowProjectOutput {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.ok === false && record.error === "unknown_slug") return true;
  return (
    record.ok === true &&
    typeof record.slug === "string" &&
    typeof record.title === "string" &&
    typeof record.summary === "string"
  );
}

/** Project slugs the model has already shown cards for — drives graph highlights. */
function highlightSlugsFromMessages(messages: UIMessage[]): string[] {
  const slugs: string[] = [];
  const seen = new Set<string>();
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    for (const part of message.parts) {
      if (part.type !== "tool-showProject") continue;
      if (part.state !== "output-available") continue;
      if (!isShowProjectOutput(part.output) || !part.output.ok) continue;
      if (seen.has(part.output.slug)) continue;
      seen.add(part.output.slug);
      slugs.push(part.output.slug);
    }
  }
  return slugs;
}

function renderParts(
  message: UIMessage,
  lang: Locale,
  work: WorkCopy,
): ReactNode[] {
  return message.parts.flatMap((part, index) => {
    if (part.type === "text" && part.text) {
      return [
        <p key={`${message.id}-t-${index}`} className="whitespace-pre-wrap">
          {part.text}
        </p>,
      ];
    }

    // Server-executed tool — typed part name is `tool-showProject` in AI SDK UI.
    if (part.type === "tool-showProject") {
      if (part.state === "output-available" && isShowProjectOutput(part.output)) {
        if (!part.output.ok) return [];
        return [
          <ProjectCard
            key={part.toolCallId}
            lang={lang}
            project={part.output}
            work={work}
          />,
        ];
      }
      if (part.state === "input-streaming" || part.state === "input-available") {
        return [
          <p
            key={part.toolCallId}
            className={cn("font-mono text-eyebrow uppercase", TEXT.faint)}
          >
            …
          </p>,
        ];
      }
    }

    return [];
  });
}

/** Map transport errors to localized copy. 429 body includes "Too many requests". */
function errorCopy(error: Error | undefined, copy: ChatCopy): string | null {
  if (!error) return null;
  const raw = error.message;
  if (/too many requests|429/i.test(raw)) return copy.rateLimited;
  try {
    const parsed = JSON.parse(raw) as { error?: string };
    if (parsed.error && /too many requests/i.test(parsed.error)) {
      return copy.rateLimited;
    }
  } catch {
    // not JSON — fall through
  }
  return copy.unavailable;
}

function useFocusTrap(
  active: boolean,
  rootRef: React.RefObject<HTMLElement | null>,
  onEscape: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    if (!root) return;

    const focusable = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0);

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Prefer the close control so Esc/Tab start at a known place.
    const closeBtn = root.querySelector<HTMLElement>("[data-chat-close]");
    (closeBtn ?? focusable()[0])?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
        return;
      }
      if (event.key !== "Tab") return;
      const list = focusable();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [active, onEscape, rootRef]);
}

export function ChatPanel({
  lang,
  copy,
  work,
}: {
  lang: Locale;
  copy: ChatCopy;
  work: WorkCopy;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const close = useCallback(() => setOpen(false), []);
  useFocusTrap(open, panelRef, close);

  const { setStreaming, setHighlightSlugs } = useGraphActivity();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { locale: lang },
      }),
    [lang],
  );

  const { messages, sendMessage, status, error, regenerate, stop } = useChat({
    transport,
  });

  const busy = status === "submitted" || status === "streaming";
  const errText = errorCopy(error, copy);

  // Graph activity: pulse while the bot works; light project nodes for cards.
  // No-ops when the graph is absent (case study pages) or WebGL is off.
  useEffect(() => {
    setStreaming(busy);
    return () => setStreaming(false);
  }, [busy, setStreaming]);

  useEffect(() => {
    setHighlightSlugs(highlightSlugsFromMessages(messages));
  }, [messages, setHighlightSlugs]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status, open, errText]);

  const submitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    void sendMessage({ text: trimmed });
    setInput("");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitText(input);
  };

  const onLauncherKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <>
      {/*
        Launcher stays in the tab order when the panel is closed so the site
        never depends on the chat, and opening is always keyboard-reachable.
      */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          onKeyDown={onLauncherKey}
          aria-expanded={false}
          aria-haspopup="dialog"
          className={cn(
            "fixed bottom-5 right-5 z-40 max-w-[min(100%-2.5rem,16rem)]",
            "border border-border bg-card px-4 py-3 text-left text-sm font-medium shadow-sm",
            "transition-colors hover:border-primary hover:text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {copy.open}
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-end sm:justify-end sm:p-5"
          // Backdrop click closes — same as Esc. The dialog itself stops propagation.
        >
          <button
            type="button"
            aria-label={copy.close}
            className="absolute inset-0 bg-foreground/20"
            onClick={close}
          />

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              SURFACE.panelStrong,
              "relative flex h-[min(85vh,36rem)] w-full flex-col sm:w-[min(100%,24rem)]",
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <h2 id={titleId} className="text-sm font-semibold tracking-tight">
                {copy.title}
              </h2>
              <button
                type="button"
                data-chat-close
                onClick={close}
                className={cn(
                  "text-sm",
                  TEXT.subtle,
                  "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                {copy.close}
              </button>
            </header>

            <div
              ref={listRef}
              className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3"
              aria-live="polite"
            >
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className={cn("text-sm", TEXT.subtle)}>{copy.emptyHint}</p>
                  <ul className="flex flex-col gap-2">
                    {SUGGESTION_KEYS.map((key) => (
                      <li key={key}>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => submitText(copy.suggestions[key])}
                          className={cn(
                            "w-full border border-border bg-muted/30 px-3 py-2 text-left text-sm",
                            "transition-colors hover:border-primary hover:bg-muted/50",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            "disabled:opacity-50",
                          )}
                        >
                          {copy.suggestions[key]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {messages.map((message) => {
                const parts = renderParts(message, lang, work);
                if (parts.length === 0) return null;
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "space-y-2 text-sm leading-relaxed",
                      message.role === "user" ? "text-foreground" : TEXT.subtle,
                    )}
                  >
                    <p className={cn("font-mono text-eyebrow uppercase", TEXT.faint)}>
                      {message.role === "user" ? copy.you : copy.assistant}
                    </p>
                    {parts}
                  </div>
                );
              })}

              {busy && (
                <p className={cn("font-mono text-eyebrow uppercase", TEXT.faint)} aria-live="polite">
                  {copy.thinking}
                </p>
              )}

              {errText && (
                <div className="space-y-2 border border-border bg-muted/30 px-3 py-2 text-sm">
                  <p>{errText}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void regenerate()}
                    disabled={busy}
                  >
                    {copy.retry}
                  </Button>
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="border-t border-border p-3">
              <label className="sr-only" htmlFor={`${titleId}-input`}>
                {copy.placeholder}
              </label>
              <div className="flex gap-2">
                <input
                  id={`${titleId}-input`}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={copy.placeholder}
                  disabled={busy}
                  maxLength={2000}
                  autoComplete="off"
                  className={cn(
                    "min-w-0 flex-1 border border-border bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground-faint",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "disabled:opacity-50",
                  )}
                />
                {busy ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => stop()}>
                    {copy.stop}
                  </Button>
                ) : (
                  <Button type="submit" size="sm" disabled={!input.trim()}>
                    {copy.send}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
