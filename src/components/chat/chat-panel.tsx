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
  type KeyboardEvent,
  type ReactNode,
} from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { Button } from "@/components/ui/button";
import { useGraphActivity } from "@/components/graph/activity";
import { TEXT } from "@/lib/design";
import type { ShowProjectOutput } from "@/lib/chat-tools";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { MessageContent } from "./message-content";
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

function messageHasVisibleText(message: UIMessage): boolean {
  return message.parts.some(
    (part) => part.type === "text" && Boolean(part.text?.trim()),
  );
}

function renderParts(
  message: UIMessage,
  lang: Locale,
  work: WorkCopy,
  streaming: boolean,
): ReactNode[] {
  return message.parts.flatMap((part, index) => {
    if (part.type === "text" && part.text) {
      const showCaret =
        streaming &&
        message.role === "assistant" &&
        index === message.parts.length - 1;
      return [
        <div key={`${message.id}-t-${index}`} className="relative">
          <MessageContent text={part.text} />
          {showCaret ? (
            <span
              className="chat-stream-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-primary align-baseline"
              aria-hidden
            />
          ) : null}
        </div>,
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
            className={cn(
              "font-mono text-eyebrow uppercase tracking-[0.14em]",
              TEXT.faint,
            )}
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

function BusyDots({ label }: { label: string }) {
  return (
    <div
      className="chat-msg flex items-center gap-3 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <span className="flex items-center gap-1" aria-hidden>
        <span className="chat-busy-dot size-1.5 rounded-full bg-primary" />
        <span className="chat-busy-dot size-1.5 rounded-full bg-primary" />
        <span className="chat-busy-dot size-1.5 rounded-full bg-primary" />
      </span>
      <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-primary">
        {label}
      </span>
    </div>
  );
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
  const streaming = status === "streaming";
  const errText = errorCopy(error, copy);

  const lastMessage = messages[messages.length - 1];
  const awaitingFirstToken =
    busy &&
    (messages.length === 0 ||
      lastMessage?.role === "user" ||
      (lastMessage?.role === "assistant" && !messageHasVisibleText(lastMessage)));

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
  }, [messages, status, errText, awaitingFirstToken]);

  const submitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    void sendMessage({ text: trimmed });
    setInput("");
    // Reset textarea height after send.
    const node = inputRef.current;
    if (node) node.style.height = "auto";
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitText(input);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    submitText(input);
  };

  const onInput = (value: string) => {
    setInput(value);
    const node = inputRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
  };

  return (
    <div
      className={cn(
        "chat-shell flex min-h-[28rem] flex-col overflow-hidden",
        "border border-border-strong bg-surface-2",
      )}
      aria-labelledby={titleId}
    >
      <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h3
            id={titleId}
            className="font-mono text-eyebrow uppercase tracking-[0.14em] text-muted-foreground"
          >
            {copy.title}
          </h3>
          <p className={cn("mt-1 truncate text-xs leading-snug sm:text-sm", TEXT.faint)}>
            {copy.lead}
          </p>
        </div>
        {busy ? (
          <span
            className="hidden shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-primary sm:inline"
            aria-live="polite"
          >
            {copy.thinking}
          </span>
        ) : null}
      </header>

      <div
        ref={listRef}
        className="flex max-h-[min(58vh,28rem)] min-h-[16rem] flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
        aria-live="polite"
      >
        {messages.length === 0 && !busy ? (
          <div className="chat-msg my-auto max-w-xl">
            <p className={cn("text-sm leading-relaxed", TEXT.subtle)}>{copy.emptyHint}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SUGGESTION_KEYS.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => submitText(copy.suggestions[key])}
                    className={cn(
                      "rounded-full border border-border-strong bg-background/40 px-4 py-2 text-left text-sm leading-snug",
                      "transition-[border-color,color,transform,opacity] duration-200",
                      "[transition-timing-function:var(--ease-out-quart)]",
                      "hover:border-primary hover:text-primary active:scale-[0.98]",
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
        ) : null}

        {messages.map((message) => {
          const parts = renderParts(message, lang, work, streaming && message === lastMessage);
          if (parts.length === 0) return null;
          const isUser = message.role === "user";
          return (
            <article
              key={message.id}
              className={cn(
                "chat-msg flex w-full flex-col gap-1.5",
                isUser ? "items-end" : "items-start",
              )}
            >
              <p
                className={cn(
                  "font-mono text-[0.58rem] uppercase tracking-[0.14em]",
                  TEXT.faint,
                )}
              >
                {isUser ? copy.you : copy.assistant}
              </p>
              <div
                className={cn(
                  "max-w-[min(100%,36rem)] text-sm leading-relaxed",
                  isUser
                    ? "rounded-2xl rounded-br-md border border-primary/30 bg-primary/10 px-4 py-3 text-foreground"
                    : cn(
                        "rounded-2xl rounded-bl-md border border-border bg-surface-1/80 px-4 py-3",
                        TEXT.subtle,
                      ),
                )}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap text-pretty text-foreground">
                    {message.parts
                      .filter((p) => p.type === "text")
                      .map((p) => (p.type === "text" ? p.text : ""))
                      .join("")}
                  </p>
                ) : (
                  <div className="space-y-3">{parts}</div>
                )}
              </div>
            </article>
          );
        })}

        {awaitingFirstToken ? <BusyDots label={copy.thinking} /> : null}

        {errText ? (
          <div className="chat-msg space-y-3 border border-border bg-surface-1 px-4 py-3 text-sm">
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
        ) : null}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-border bg-surface-2/90 px-4 py-4 backdrop-blur-sm sm:px-5"
      >
        <label className="sr-only" htmlFor={`${titleId}-input`}>
          {copy.placeholder}
        </label>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            id={`${titleId}-input`}
            value={input}
            onChange={(event) => onInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={copy.placeholder}
            disabled={busy}
            maxLength={2000}
            rows={1}
            autoComplete="off"
            enterKeyHint="send"
            className={cn(
              "min-h-11 max-h-40 min-w-0 flex-1 resize-none rounded-2xl border border-border-strong bg-background px-4 py-2.5 text-sm leading-relaxed",
              "placeholder:text-muted-foreground-faint",
              "transition-[border-color,box-shadow] duration-200",
              "[transition-timing-function:var(--ease-out-quart)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:opacity-50",
            )}
          />
          {busy ? (
            <Button type="button" variant="outline" size="sm" onClick={() => stop()}>
              {copy.stop}
            </Button>
          ) : (
            <Button type="submit" size="sm" disabled={!input.trim()} className="shrink-0">
              {copy.send}
            </Button>
          )}
        </div>
        <p className={cn("mt-2 hidden text-[0.65rem] sm:block", TEXT.faint)}>
          {copy.composerHint}
        </p>
      </form>
    </div>
  );
}
