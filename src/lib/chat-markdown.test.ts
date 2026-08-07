import { describe, expect, it } from "vitest";

import { parseChatMarkdown, parseInlines } from "./chat-markdown";

describe("parseInlines", () => {
  it("parses strong, em, and code", () => {
    expect(parseInlines("He is a **Blockchain Mentor** at *Polinema* using `Besu`.")).toEqual([
      { type: "text", value: "He is a " },
      { type: "strong", value: "Blockchain Mentor" },
      { type: "text", value: " at " },
      { type: "em", value: "Polinema" },
      { type: "text", value: " using " },
      { type: "code", value: "Besu" },
      { type: "text", value: "." },
    ]);
  });

  it("returns plain text when there is no markup", () => {
    expect(parseInlines("plain")).toEqual([{ type: "text", value: "plain" }]);
  });
});

describe("parseChatMarkdown", () => {
  it("splits paragraphs on blank lines", () => {
    const blocks = parseChatMarkdown("First paragraph.\n\nSecond paragraph.");
    expect(blocks).toEqual([
      { type: "p", inlines: [{ type: "text", value: "First paragraph." }] },
      { type: "p", inlines: [{ type: "text", value: "Second paragraph." }] },
    ]);
  });

  it("parses unordered lists", () => {
    const blocks = parseChatMarkdown("- Alpha\n- **Beta**\n- Gamma");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.type).toBe("ul");
    if (blocks[0]?.type !== "ul") return;
    expect(blocks[0].items).toHaveLength(3);
    expect(blocks[0].items[1]).toEqual([{ type: "strong", value: "Beta" }]);
  });

  it("parses ordered lists", () => {
    const blocks = parseChatMarkdown("1. One\n2. Two");
    expect(blocks[0]?.type).toBe("ol");
  });

  it("does not invent HTML and leaves angle brackets as text", () => {
    const blocks = parseChatMarkdown("Use <script>alert(1)</script> never.");
    expect(blocks[0]).toEqual({
      type: "p",
      inlines: [{ type: "text", value: "Use <script>alert(1)</script> never." }],
    });
  });

  it("returns empty for blank input", () => {
    expect(parseChatMarkdown("   \n  ")).toEqual([]);
  });
});
