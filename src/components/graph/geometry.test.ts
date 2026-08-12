import { describe, expect, it } from "vitest";

import {
  buildGraphGeometry,
  IDLE_GRAPH,
  MAX_EDGES,
  NODE_COUNT,
  SIGNAL_INDEX,
} from "./geometry";

describe("buildGraphGeometry", () => {
  it("matches the composed world shape", () => {
    expect(IDLE_GRAPH.nodeCount).toBe(NODE_COUNT);
    expect(IDLE_GRAPH.nodeCount).toBe(650);
    expect(IDLE_GRAPH.edgeCount).toBeGreaterThan(0);
    expect(IDLE_GRAPH.edgeCount).toBeLessThanOrEqual(MAX_EDGES);
    expect(IDLE_GRAPH.signalIndex).toBe(SIGNAL_INDEX);
    expect(IDLE_GRAPH.positions).toHaveLength(NODE_COUNT * 3);
    expect(IDLE_GRAPH.edgePositions).toHaveLength(IDLE_GRAPH.edgeCount * 6);
    expect(IDLE_GRAPH.edges).toHaveLength(IDLE_GRAPH.edgeCount * 2);
  });

  it("emits edge indices inside the node range", () => {
    for (let i = 0; i < IDLE_GRAPH.edges.length; i++) {
      expect(IDLE_GRAPH.edges[i]).toBeGreaterThanOrEqual(0);
      expect(IDLE_GRAPH.edges[i]).toBeLessThan(NODE_COUNT);
    }
  });

  it("is deterministic for a given seed", () => {
    const a = buildGraphGeometry(1);
    const b = buildGraphGeometry(1);
    expect(a.positions).toEqual(b.positions);
    expect(a.edgePositions).toEqual(b.edgePositions);
    expect(a.edgeCount).toBe(b.edgeCount);
  });

  it("changes when the seed changes", () => {
    const a = buildGraphGeometry(1);
    const b = buildGraphGeometry(2);
    expect(a.positions).not.toEqual(b.positions);
  });

  it("emits only finite coordinates", () => {
    for (let i = 0; i < IDLE_GRAPH.positions.length; i++) {
      expect(Number.isFinite(IDLE_GRAPH.positions[i])).toBe(true);
    }
    for (let i = 0; i < IDLE_GRAPH.edgePositions.length; i++) {
      expect(Number.isFinite(IDLE_GRAPH.edgePositions[i])).toBe(true);
    }
  });
});
