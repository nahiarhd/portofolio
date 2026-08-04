import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { buildSystemPrompt } from "@/lib/chat-prompt";
import { createShowProjectTool } from "@/lib/chat-tools";
import { DEFAULT_LOCALE, isLocale } from "@/lib/locale";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

/**
 * The only dynamic route on the site. Everything else is static.
 *
 * The site must work completely with the chat closed, so every failure here is
 * contained: a bad request, a missing key, or an upstream outage returns an
 * error the UI renders as a message. It never takes a page down.
 */

export const maxDuration = 30;

/**
 * Caps. This endpoint is public and bills someone, so neither the input nor the
 * output is allowed to be unbounded.
 */
const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 2_000;
const MAX_OUTPUT_TOKENS = 800;

/**
 * Two windows from one limiter. The burst window keeps a single visitor's
 * conversation feeling unrestricted while stopping a script; the sustained
 * window is what actually bounds the daily bill, since 8/minute alone would
 * permit over 11,000 generations a day from one address.
 *
 * Module scope on purpose: the closure must outlive a single request. Fluid
 * Compute reuses instances, so this survives between invocations.
 */
const burstLimit = createRateLimiter({ limit: 8, windowMs: 60_000 });
const sustainedLimit = createRateLimiter({ limit: 60, windowMs: 60 * 60_000 });

/**
 * Read at request time, never at module scope: the production build must never
 * need a secret, and a missing variable should fail this one request rather
 * than the whole deployment.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env and fill in the LLM_* variables.`,
    );
  }
  return value;
}

export async function POST(request: Request) {
  /*
   * Rate limiting runs before parsing and before any upstream call. This
   * endpoint spends someone else's GPU capacity, so the cheapest possible
   * rejection has to come first.
   */
  const caller = clientKey(request);
  const decision = [burstLimit(caller), sustainedLimit(caller)].find(
    (result) => !result.allowed,
  );
  if (decision) {
    return Response.json(
      { error: "Too many requests. Try again shortly." },
      {
        status: 429,
        headers: { "retry-after": String(decision.retryAfterSeconds) },
      },
    );
  }

  let body: { messages?: UIMessage[]; locale?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages supplied." }, { status: 400 });
  }

  if (messages.length > MAX_MESSAGES) {
    return Response.json(
      { error: `Conversation too long. Start a new one.` },
      { status: 413 },
    );
  }

  const tooLong = messages.some((message) =>
    message.parts?.some(
      (part) => part.type === "text" && part.text.length > MAX_CHARS_PER_MESSAGE,
    ),
  );
  if (tooLong) {
    return Response.json({ error: "Message too long." }, { status: 413 });
  }

  // Narrowed through the type guard rather than cast: the locale comes from the
  // client and decides which language the model is told to answer in.
  const requested = body.locale ?? "";
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;

  try {
    // No provider name, URL, or model id in source — see AGENTS.md. Swapping
    // providers is an environment change, not a code change.
    const provider = createOpenAICompatible({
      name: "llm",
      baseURL: requireEnv("LLM_BASE_URL"),
      apiKey: requireEnv("LLM_API_KEY"),
    });

    const result = streamText({
      model: provider(requireEnv("LLM_MODEL")),
      instructions: buildSystemPrompt(locale),
      messages: await convertToModelMessages(messages),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      tools: {
        showProject: createShowProjectTool(locale),
      },
      // Tool call + follow-up text (and maybe a second card) need more than one
      // step. Cap keeps a runaway loop from chewing tokens.
      stopWhen: isStepCount(5),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    // The message may name the upstream host, so it is logged rather than
    // returned. The client gets something it can render without leaking config.
    console.error("[chat]", error);
    return Response.json(
      { error: "The assistant is unavailable right now." },
      { status: 502 },
    );
  }
}
