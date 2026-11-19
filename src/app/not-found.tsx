"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "70vh",
      padding: "24px",
      textAlign: "center",
      fontFamily: "var(--font-sans, sans-serif)",
      color: "var(--ink-primary, #241915)",
    }}>
      <h1 style={{
        fontSize: "3rem",
        fontWeight: 700,
        marginBottom: "12px",
        color: "var(--accent-primary, #C0502B)",
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: "1.25rem",
        fontWeight: 600,
        marginBottom: "16px",
      }}>
        Page Not Found
      </h2>
      <p style={{
        maxWidth: "420px",
        marginBottom: "24px",
        color: "var(--ink-secondary, #52423A)",
        lineHeight: 1.6,
      }}>
        The requested resource could not be found. Please return to the KendraFi command workspace.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "10px 20px",
          borderRadius: "8px",
          background: "var(--accent-primary, #C0502B)",
          color: "#FFFDF9",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Return to Workspace
      </Link>
    </div>
  );
}
