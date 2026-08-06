import { describe, expect, it } from "vitest";

import { REDACTION_MARKER, stripRedactionMarkers } from "./redaction";

describe("stripRedactionMarkers", () => {
  it("replaces the marker with an ellipsis by default", () => {
    expect(stripRedactionMarkers(`for ${REDACTION_MARKER} without`)).toBe("for … without");
  });

  it("leaves plain text unchanged", () => {
    expect(stripRedactionMarkers("fully public summary")).toBe("fully public summary");
  });

  it("accepts a custom replacement", () => {
    expect(stripRedactionMarkers(`x ${REDACTION_MARKER} y`, "[NDA]")).toBe("x [NDA] y");
  });
});
