import type { ReactNode } from "react";

import { parseChatMarkdown, type MdInline } from "@/lib/chat-markdown";
import { cn } from "@/lib/utils";

function renderInlines(inlines: MdInline[], keyPrefix: string): ReactNode[] {
  return inlines.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    switch (part.type) {
      case "strong":
        return (
          <strong key={key} className="font-semibold text-foreground">
            {part.value}
          </strong>
        );
      case "em":
        return (
          <em key={key} className="italic text-foreground/90">
            {part.value}
          </em>
        );
      case "code":
        return (
          <code
            key={key}
            className="rounded-sm bg-surface-3/80 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
          >
            {part.value}
          </code>
        );
      default:
        return <span key={key}>{part.value}</span>;
    }
  });
}

/**
 * Renders assistant text as structured blocks. Built from tokens, never from
 * `dangerouslySetInnerHTML` — model output stays text nodes.
 */
export function MessageContent({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const blocks = parseChatMarkdown(text);

  if (blocks.length === 0) {
    return <p className={cn("whitespace-pre-wrap", className)}>{text}</p>;
  }

  return (
    <div className={cn("chat-md space-y-3", className)}>
      {blocks.map((block, i) => {
        if (block.type === "p") {
          return (
            <p key={`p-${i}`} className="text-pretty leading-relaxed">
              {renderInlines(block.inlines, `p${i}`)}
            </p>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={`ul-${i}`} className="list-disc space-y-1.5 pl-5 marker:text-primary/70">
              {block.items.map((item, j) => (
                <li key={`uli-${j}`} className="leading-relaxed pl-0.5">
                  {renderInlines(item, `ul${i}-${j}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <ol key={`ol-${i}`} className="list-decimal space-y-1.5 pl-5 marker:text-primary/70">
            {block.items.map((item, j) => (
              <li key={`oli-${j}`} className="leading-relaxed pl-0.5">
                {renderInlines(item, `ol${i}-${j}`)}
              </li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
