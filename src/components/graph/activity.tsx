"use client";

/**
 * Bridges chat → hero graph without coupling their modules.
 *
 * Chat writes streaming + project-slug highlights; the R3F scene reads them.
 * Default values are no-ops so a page without the provider still renders, and
 * chat stays fully usable when the graph is absent or WebGL is off.
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
  setStreaming: (streaming: boolean) => void;
  setHighlightSlugs: (slugs: readonly string[]) => void;
};

const GraphActivityContext = createContext<GraphActivityValue>({
  streaming: false,
  highlightSlugs: [],
  setStreaming: () => {},
  setHighlightSlugs: () => {},
});

export function GraphActivityProvider({ children }: { children: ReactNode }) {
  const [streaming, setStreamingState] = useState(false);
  const [highlightSlugs, setHighlightSlugsState] = useState<readonly string[]>(
    [],
  );

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

  const value = useMemo(
    () => ({
      streaming,
      highlightSlugs,
      setStreaming,
      setHighlightSlugs,
    }),
    [streaming, highlightSlugs, setStreaming, setHighlightSlugs],
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
