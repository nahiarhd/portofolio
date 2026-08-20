"use client";

/**
 * ChatFolio interactive terminal assistant. Embedded in the final page section.
 * Modeled after modern editorial portfolio chat interfaces.
 */

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { useGraphActivity } from "@/components/graph/activity";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { GITHUB_URL, HUGGINGFACE_URL, profile } from "@/content/profile";
import type { ShowProjectOutput } from "@/lib/chat-tools";
import { TEXT } from "@/lib/design";
import type { Locale } from "@/lib/locale";
import { playSound } from "@/lib/sound";
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="chat-msg flex items-center gap-3 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <span className="flex items-center gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            className="size-1.5 rounded-full bg-primary"
          />
        ))}
      </span>
      <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-primary">
        {label}
      </span>
    </motion.div>
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
  const shouldReduceMotion = useReducedMotion();
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

  useLayoutEffect(() => {
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
    playSound("blip");
    void sendMessage({ text: trimmed });
    setInput("");
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
    node.style.height = `${Math.min(node.scrollHeight, 140)}px`;
  };

  return (
    <div
      className={cn(
        "chat-shell relative overflow-hidden rounded-[2rem] border-2 border-primary/40 bg-surface-1/95 p-4 sm:p-6 lg:p-7 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl",
      )}
      aria-labelledby={titleId}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7">
        {/* Left Column: Operator Dossier & Cutout Portrait */}
        <aside className="flex flex-col justify-between rounded-2xl border border-border/80 bg-surface-2/60 p-5 sm:p-6 lg:col-span-4">
          <div>
            {/* Operator Name */}
            <div className="border-b border-border/70 pb-4">
              <span className="font-mono text-[0.62rem] uppercase tracking-widest text-primary font-bold">
                OPERATOR PROFILE
              </span>
              <h3 className="mt-1 font-display text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl leading-none">
                RAIHAN
                <br />
                DJUNAEDI
              </h3>
            </div>

            {/* Focus Subtitle */}
            <p className="mt-3.5 font-sans text-xs leading-relaxed text-muted-foreground">
              {lang === "id"
                ? "Arsitek Solusi AI & Spesialis NLP. Merancang sistem agent otonom dan pipeline zero egress."
                : "AI Solutions Architect & NLP Specialist. Designing autonomous agent systems and zero-egress pipelines."}
            </p>
          </div>

          {/* Portrait Stage */}
          <div className="relative my-5 flex h-60 w-full items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-gradient-to-b from-surface-1/50 to-surface-1/90 sm:h-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/portrait-cutout.png"
              alt="Raihan Djunaedi"
              className="h-full w-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-md border border-primary/40 bg-surface-1/90 px-2 py-0.5 font-mono text-[0.58rem] font-bold uppercase tracking-wider text-primary shadow-md backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE AGENT</span>
            </div>
          </div>

          {/* Social Icons Row & Copyright */}
          <div className="space-y-3 border-t border-border/70 pt-4">
            <div className="flex items-center justify-between gap-2">
              <a
                href={`mailto:${profile.email}`}
                className="flex size-9 items-center justify-center rounded-full border border-border bg-surface-1 font-mono text-xs font-bold text-muted-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                title="Direct Email"
              >
                ✉
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-surface-1 font-mono text-xs font-bold text-muted-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                title="LinkedIn"
              >
                in
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-surface-1 font-mono text-xs font-bold text-muted-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                title="GitHub"
              >
                gh
              </a>
              <a
                href={HUGGINGFACE_URL}
                target="_blank"
                rel="noreferrer"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-surface-1 font-mono text-xs font-bold text-muted-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                title="Hugging Face"
              >
                hf
              </a>
            </div>

            <p className="text-center font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground/60">
              © 2026 ChatFolio · AI Assistant
            </p>
          </div>
        </aside>

        {/* Right Column: Interactive Portfolio Chat Terminal */}
        <section className="flex flex-col justify-between rounded-2xl border border-border/80 bg-surface-2/40 p-4 sm:p-6 lg:col-span-8">
          {/* Terminal Header */}
          <header className="flex items-center justify-between border-b border-border/80 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3
                id={titleId}
                className="font-mono text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Portfolio Chat
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {busy ? (
                <span className="font-mono text-[0.6rem] uppercase tracking-widest text-primary animate-pulse">
                  {copy.thinking}
                </span>
              ) : (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wider text-primary">
                  99% ACCURACY
                </span>
              )}
            </div>
          </header>

          {/* Chat Messages Stream */}
          <div
            ref={listRef}
            className="my-3 flex max-h-[min(52vh,26rem)] min-h-[16rem] flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pr-2"
            aria-live="polite"
          >
            {messages.length === 0 && !busy ? (
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="chat-msg my-auto space-y-4"
              >
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-wider text-primary font-bold">
                    AI ASSISTANT · AIR-GAPPED INTEL
                  </p>
                  <p className="mt-1 font-mono text-sm leading-relaxed text-foreground/90">
                    {lang === "id"
                      ? "Halo! Saya asisten arsitektur AI Raihan. Tanyakan seputar model NLP, pipeline air-gapped, atau 12 studi kasus produksi."
                      : "Hi there! I am Raihan's autonomous portfolio agent. Ask me about his NLP models, air-gapped pipelines, or production case studies."}
                  </p>
                </div>

                <div className="border-t border-border/60 pt-3">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground mb-2">
                    {copy.emptyHint}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {SUGGESTION_KEYS.map((key) => (
                      <li key={key}>
                        <motion.button
                          type="button"
                          disabled={busy}
                          whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                          onClick={() => submitText(copy.suggestions[key])}
                          className={cn(
                            "rounded-xl border border-border bg-surface-1/90 px-3.5 py-1.5 text-left font-mono text-xs leading-snug text-foreground/80 cursor-pointer",
                            "transition-all duration-200 hover:border-primary hover:text-primary hover:bg-primary/10",
                          )}
                        >
                          {copy.suggestions[key]}
                        </motion.button>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : null}

            <AnimatePresence initial={false}>
              {messages.map((message) => {
                const parts = renderParts(
                  message,
                  lang,
                  work,
                  streaming && message === lastMessage,
                );
                if (parts.length === 0) return null;
                const isUser = message.role === "user";
                return (
                  <motion.article
                    key={message.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 340, damping: 28 }}
                    className={cn(
                      "chat-msg flex w-full flex-col gap-1.5",
                      isUser ? "items-end" : "items-start",
                    )}
                  >
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
                      {isUser ? copy.you : "RAIHAN (AI AGENT)"}
                    </p>
                    <div
                      className={cn(
                        "max-w-[min(100%,36rem)] text-sm leading-relaxed",
                        isUser
                          ? "rounded-2xl rounded-br-md border border-primary/40 bg-primary/15 px-4 py-3 text-foreground"
                          : "rounded-2xl rounded-bl-md border border-border bg-surface-1/95 px-4 py-3 text-foreground",
                      )}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-pretty font-mono text-xs text-foreground sm:text-sm">
                          {message.parts
                            .filter((p) => p.type === "text")
                            .map((p) => (p.type === "text" ? p.text : ""))
                            .join("")}
                        </p>
                      ) : (
                        <div className="space-y-3 font-mono text-xs text-foreground/90 sm:text-sm">
                          {parts}
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>

            {awaitingFirstToken ? <BusyDots label={copy.thinking} /> : null}

            {errText ? (
              <div className="chat-msg space-y-3 rounded-xl border border-border bg-surface-1 p-4 text-sm">
                <p className="text-muted-foreground">{errText}</p>
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

          {/* Bottom Prompt Composer Bar */}
          <form onSubmit={onSubmit} className="border-t border-border/80 pt-3">
            <label className="sr-only" htmlFor={`${titleId}-input`}>
              {copy.placeholder}
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-border-strong bg-surface-1/90 px-3 py-2 shadow-inner focus-within:border-primary">
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
                className="min-h-9 max-h-32 min-w-0 flex-1 resize-none bg-transparent font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none sm:text-sm"
              />
              {busy ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => stop()}
                  className="shrink-0"
                >
                  {copy.stop}
                </Button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-black transition-all cursor-pointer",
                    input.trim()
                      ? "opacity-100 shadow-[0_0_16px_rgba(184,131,236,0.5)] hover:scale-105"
                      : "opacity-40",
                  )}
                  title="Send Prompt"
                >
                  ✦
                </button>
              )}
            </div>
            <p className="mt-1.5 hidden font-mono text-[0.6rem] text-muted-foreground/70 sm:block">
              {copy.composerHint}
            </p>
          </form>
        </section>
      </div>

      <BorderBeam size={280} duration={14} colorFrom="#b883ec" colorTo="#38bdf8" />
    </div>
  );
}

export default ChatPanel;
