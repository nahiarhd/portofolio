/**
 * Idle hero graph geometry — generated once, never during render.
 *
 * React Compiler treats `Math.random()` / `performance.now()` during render as
 * errors (`react-hooks/purity`). A seeded LCG at module load is deterministic
 * and pure from React's point of view. S2 measured 58fps on this exact shape:
 * 400 instanced nodes + ≤600 line-segment edges.
 */

export const NODE_COUNT = 400;
export const MAX_EDGES = 600;
/** Accent node — the single deviation from the calm baseline. */
export const SIGNAL_INDEX = 0;

/** Fixed seed so the hero is a signature, not noise that reshuffles. */
const SEED = 0xa93e5;

export type GraphGeometry = {
  nodeCount: number;
  signalIndex: number;
  /** xyz packed, length `nodeCount * 3`. */
  positions: Float32Array;
  edgeCount: number;
  /** endpoint pairs packed as xyzxyz, length `edgeCount * 6`. */
  edgePositions: Float32Array;
};

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Build a flat-ish ellipsoid cloud and connect each node to its three nearest
 * neighbours, capped at {@link MAX_EDGES}. Pure and deterministic for a seed.
 */
export function buildGraphGeometry(seed: number = SEED): GraphGeometry {
  const rand = createRng(seed);
  const positions = new Float32Array(NODE_COUNT * 3);

  for (let i = 0; i < NODE_COUNT; i++) {
    let x = 0;
    let y = 0;
    let z = 0;
    let r2 = 0;
    // Rejection sample in the unit ball so density is even, then scale into an
    // ellipsoid that matches the hero's wide 800×480 frame.
    do {
      x = rand() * 2 - 1;
      y = rand() * 2 - 1;
      z = rand() * 2 - 1;
      r2 = x * x + y * y + z * z;
    } while (r2 > 1 || r2 < 1e-4);

    const inv = (0.55 + 0.45 * rand()) / Math.sqrt(r2);
    positions[i * 3] = x * inv * 3.2;
    positions[i * 3 + 1] = y * inv * 1.75;
    positions[i * 3 + 2] = z * inv * 1.5;
  }

  const K = 3;
  const seen = new Set<number>();
  const pairs: number[] = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    const nearest: { j: number; d: number }[] = [];
    const ix = positions[i * 3];
    const iy = positions[i * 3 + 1];
    const iz = positions[i * 3 + 2];

    for (let j = 0; j < NODE_COUNT; j++) {
      if (j === i) continue;
      const dx = ix - positions[j * 3];
      const dy = iy - positions[j * 3 + 1];
      const dz = iz - positions[j * 3 + 2];
      nearest.push({ j, d: dx * dx + dy * dy + dz * dz });
    }

    nearest.sort((a, b) => a.d - b.d);

    for (let k = 0; k < K; k++) {
      const j = nearest[k].j;
      const a = i < j ? i : j;
      const b = i < j ? j : i;
      // Pack undirected edge into one int key: a and b are < 400.
      const key = a * NODE_COUNT + b;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push(a, b);
      if (pairs.length / 2 >= MAX_EDGES) break;
    }
    if (pairs.length / 2 >= MAX_EDGES) break;
  }

  const edgeCount = pairs.length / 2;
  const edgePositions = new Float32Array(edgeCount * 6);
  for (let e = 0; e < edgeCount; e++) {
    const a = pairs[e * 2];
    const b = pairs[e * 2 + 1];
    const o = e * 6;
    edgePositions[o] = positions[a * 3];
    edgePositions[o + 1] = positions[a * 3 + 1];
    edgePositions[o + 2] = positions[a * 3 + 2];
    edgePositions[o + 3] = positions[b * 3];
    edgePositions[o + 4] = positions[b * 3 + 1];
    edgePositions[o + 5] = positions[b * 3 + 2];
  }

  return {
    nodeCount: NODE_COUNT,
    signalIndex: SIGNAL_INDEX,
    positions,
    edgeCount,
    edgePositions,
  };
}

/** Module-load singleton — never regenerated during React render. */
export const IDLE_GRAPH: GraphGeometry = buildGraphGeometry();
