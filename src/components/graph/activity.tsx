"use client";

/**
 * Bridges chat + routing → world graph without coupling their modules.
 *
 * Chat writes streaming + project-slug highlights; RoutePulse writes
 * navigation pulses; the R3F scene reads them. Default values are no-ops so
 * a page without the provider still renders, and chat stays fully usable
 * when the graph is absent or WebGL is off.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type GraphActivityValue = {
  streaming: boolean;
  /** Project slugs returned by `showProject` in the current thread. */
  highlightSlugs: readonly string[];
  /** Monotonic counter bumped by `pulse()` — the graph's half of a route
   * transition; the scene sweeps a brightness wave on every bump. */
  pulseNonce: number;
  setStreaming: (streaming: boolean) => void;
  setHighlightSlugs: (slugs: readonly string[]) => void;
  pulse: () => void;
};

const GraphActivityContext = createContext<GraphActivityValue>({
  streaming: false,
  highlightSlugs: [],
  pulseNonce: 0,
  setStreaming: () => {},
  setHighlightSlugs: () => {},
  pulse: () => {},
});

export function GraphActivityProvider({ children }: { children: ReactNode }) {
  const [streaming, setStreamingState] = useState(false);
  const [highlightSlugs, setHighlightSlugsState] = useState<readonly string[]>(
    [],
  );
  const [pulseNonce, setPulseNonce] = useState(0);

  const setStreaming = useCallback((value: boolean) => {
    setStreamingState(value);
  }, []);

  const setHighlightSlugs = useCallback((slugs: readonly string[]) => {
    setHighlightSlugsState((prev) => {
      if (
        prev.length === slugs.length &&
        prev.every((slug, index) => slug === slugs[index])
      ) {
        return prev;
      }
      return slugs;
    });
  }, []);

  const pulse = useCallback(() => {
    setPulseNonce((nonce) => nonce + 1);
  }, []);

  const value = useMemo(
    () => ({
      streaming,
      highlightSlugs,
      pulseNonce,
      setStreaming,
      setHighlightSlugs,
      pulse,
    }),
    [streaming, highlightSlugs, pulseNonce, setStreaming, setHighlightSlugs, pulse],
  );

  return (
    <GraphActivityContext.Provider value={value}>
      {children}
    </GraphActivityContext.Provider>
  );
}

export function useGraphActivity(): GraphActivityValue {
  return useContext(GraphActivityContext);
}
