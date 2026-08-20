import { describe, expect, it } from "vitest";

import {
  deckIndexFromProgress,
  padDeckIndex,
  progressFromDeckIndex,
} from "./work-deck-progress";

describe("deckIndexFromProgress", () => {
  it("stays on the first slide for a single card", () => {
    expect(deckIndexFromProgress(0, 1)).toBe(0);
    expect(deckIndexFromProgress(1, 1)).toBe(0);
  });

  it("splits [0, 1] into equal bands", () => {
    expect(deckIndexFromProgress(0, 3)).toBe(0);
    expect(deckIndexFromProgress(0.32, 3)).toBe(0);
    expect(deckIndexFromProgress(0.34, 3)).toBe(1);
    expect(deckIndexFromProgress(0.66, 3)).toBe(1);
    expect(deckIndexFromProgress(0.67, 3)).toBe(2);
    expect(deckIndexFromProgress(1, 3)).toBe(2);
  });
});

describe("progressFromDeckIndex", () => {
  it("round-trips every click position", () => {
    for (const total of [2, 3, 6]) {
      for (let index = 0; index < total; index++) {
        const progress = progressFromDeckIndex(index, total);
        expect(deckIndexFromProgress(progress, total)).toBe(index);
      }
    }
  });
});

describe("padDeckIndex", () => {
  it("keeps two digits past nine", () => {
    expect(padDeckIndex(1)).toBe("01");
    expect(padDeckIndex(10)).toBe("10");
  });
});
