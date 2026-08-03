"use client";

/**
 * Last-resort boundary: catches errors thrown by the root layout itself.
 *
 * Because the root layout failed, this replaces it — so it must render its own
 * <html> and <body>. It only shows in production; in dev the error overlay wins.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "3rem", lineHeight: 1.6 }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Application error</h1>
        <p style={{ marginTop: "0.5rem", color: "#666" }}>
          The application failed to start. {error.digest ? `Digest: ${error.digest}` : null}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
