/**
 * Technical node graph — the hero's archival paper network.
 *
 * Renders the crisp vector network with animated signal pulses and a radiant
 * beacon ring around the primary accent node.
 */

// prettier-ignore
const NODES: readonly (readonly [number, number])[] = [[374,230],[238,313],[163,384],[391,284],[285,166],[371,413],[527,236],[523,287],[142,90],[703,95],[512,320],[475,213],[566,161],[276,326],[565,330],[579,273],[716,115],[87,209],[595,73],[181,261],[549,100],[73,156],[210,113],[254,396],[601,386],[127,288],[448,194],[710,229],[197,433],[290,228],[514,360],[639,366],[635,34],[486,127],[655,200],[72,71],[686,64],[701,210],[415,401],[108,255],[258,42],[488,144],[271,97],[655,124],[332,395],[330,420]];

// prettier-ignore
const EDGES: readonly (readonly [number, number])[] = [[0,3],[0,4],[1,2],[1,13],[2,13],[2,19],[3,10],[3,11],[4,22],[4,29],[5,13],[5,23],[6,7],[6,10],[7,10],[7,11],[8,21],[8,22],[9,16],[9,18],[10,11],[10,14],[11,12],[11,15],[12,15],[12,18],[13,19],[13,23],[14,15],[14,24],[15,24],[15,30],[16,18],[16,27],[17,19],[17,21],[18,20],[18,32],[19,25],[19,29],[20,32],[20,33],[21,35],[21,39],[22,40],[22,42],[23,28],[23,44],[24,30],[24,31],[25,39],[26,33],[26,41],[27,34],[27,37],[30,31],[30,38],[32,36],[32,43],[33,41],[34,37],[34,43],[36,43],[37,43],[38,44],[38,45],[40,42],[44,45]];

const SIGNAL_NODE = 0;

export function GraphStill({ className }: { className?: string }) {
  const signalX = NODES[SIGNAL_NODE][0];
  const signalY = NODES[SIGNAL_NODE][1];

  return (
    <svg
      viewBox="0 0 800 480"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <filter id="hero-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Network Edges */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.18">
        {EDGES.map(([from, to]) => (
          <line
            key={`${from}-${to}`}
            x1={NODES[from][0]}
            y1={NODES[from][1]}
            x2={NODES[to][0]}
            y2={NODES[to][1]}
          />
        ))}
      </g>

      {/* Standard Nodes */}
      <g fill="currentColor" opacity="0.45">
        {NODES.map(([x, y], index) =>
          index === SIGNAL_NODE ? null : (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              className="transition-transform duration-300"
            />
          ),
        )}
      </g>

      {/* Beacon Waves around Signal Node */}
      <g className="text-primary">
        <circle
          cx={signalX}
          cy={signalY}
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.3"
          className="animate-ping"
          style={{ transformOrigin: `${signalX}px ${signalY}px`, animationDuration: "3s" }}
        />
        <circle
          cx={signalX}
          cy={signalY}
          r="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.15"
          className="animate-ping"
          style={{ transformOrigin: `${signalX}px ${signalY}px`, animationDuration: "3s", animationDelay: "1s" }}
        />
      </g>

      {/* Core Signal Node */}
      <circle
        cx={signalX}
        cy={signalY}
        r="7"
        className="fill-primary shadow-lg"
        filter="url(#hero-glow)"
      />
    </svg>
  );
}
