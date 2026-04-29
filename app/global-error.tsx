"use client";

/**
 * Absolute-fallback error UI — renders when even the root layout crashes.
 * Must be a complete HTML document. Avoid any imports that could themselves fail.
 */

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#0A0A0A",
          background: "#FAF9F6",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#FF2D2D",
            marginBottom: "24px",
          }}
        />
        <h1 style={{ fontSize: "1.75rem", margin: "0 0 12px 0" }}>
          the line went quiet.
        </h1>
        <p style={{ color: "#767676", maxWidth: "360px", margin: "0 0 24px 0" }}>
          chatter hit something it couldn&rsquo;t recover from. try refreshing.
        </p>
        {error.digest && (
          <p
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.6rem",
              color: "#A8A4A0",
              marginBottom: "24px",
            }}
          >
            ref · {error.digest}
          </p>
        )}
        <a
          href="/home"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "#FF2D2D",
            color: "#FFFFFF",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          back to home
        </a>
      </body>
    </html>
  );
}
