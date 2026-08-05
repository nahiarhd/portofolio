"use client";

/**
 * Inline portfolio chat. Embedded in the page `#ask` section — not a FAB.
 * Site must work completely with this never opened / never loaded.
 */

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { Button } from "@/components/ui/button";
import { useGraphActivity } from "@/components/graph/activity";
import { TEXT } from "@/lib/design";
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
            className={cn("font-mono text-eyebrow uppercase tracking-[0.14em]", TEXT.faint)}
          >
            …
          </p>,
        ];
      }
    }

    return [];
  });
}

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
    // not JSON
  }
  return copy.unavailable;
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
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

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

  useEffect(() => {
    setStreaming(busy);
    return () => setStreaming(false);
  }, [busy, setStreaming]);

  useEffect(() => {
    setHighlightSlugs(highlightSlugsFromMessages(messages));
  }, [messages, setHighlightSlugs]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status, errText]);

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

  return (
    <div
      className="flex min-h-[min(70vh,32rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface-1"
      aria-labelledby={titleId}
    >
      <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <h3
          id={titleId}
          className="font-mono text-eyebrow uppercase tracking-[0.14em] text-muted-foreground"
        >
          {copy.title}
        </h3>
        {busy ? (
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-primary" aria-live="polite">
            {copy.thinking}
          </span>
        ) : null}
      </header>

      <div
        ref={listRef}
        className="flex max-h-[min(50vh,24rem)] flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <ul className="flex flex-col gap-2">
            {SUGGESTION_KEYS.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => submitText(copy.suggestions[key])}
                  className={cn(
                    "w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-left text-sm leading-snug",
                    "transition-colors hover:border-primary/40 hover:bg-surface-2",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "disabled:opacity-50",
                  )}
                >
                  {copy.suggestions[key]}
                </button>
              </li>
            ))}
          </ul>
        )}

        {messages.map((message) => {
          const parts = renderParts(message, lang, work);
          if (parts.length === 0) return null;
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={cn(
                "space-y-2 text-sm leading-relaxed",
                isUser
                  ? "ml-auto max-w-[min(100%,28rem)] rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-foreground"
                  : "max-w-[min(100%,36rem)]",
              )}
            >
              <p className={cn("font-mono text-[0.58rem] uppercase tracking-[0.14em]", TEXT.faint)}>
                {isUser ? copy.you : copy.assistant}
              </p>
              <div className={cn("space-y-3", !isUser && TEXT.subtle)}>{parts}</div>
            </div>
          );
        })}

        {errText && (
          <div className="space-y-3 rounded-xl border border-border bg-background/50 px-4 py-3 text-sm">
            <p className={TEXT.subtle}>{errText}</p>
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

      <form onSubmit={onSubmit} className="border-t border-border p-4 sm:p-5">
        <label className="sr-only" htmlFor={`${titleId}-input`}>
          {copy.placeholder}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            id={`${titleId}-input`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={copy.placeholder}
            disabled={busy}
            maxLength={2000}
            autoComplete="off"
            className={cn(
              "min-h-11 min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm",
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
  );
}
