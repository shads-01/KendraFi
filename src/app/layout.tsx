import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KendraFi | WeBank Weiyedai-Global Zero-Trust Multi-Agent Protocol",
  description:
    "Zero-Trust Multi-Agent Cooperative Risk and Programmable B2B Escrow Protocol for WeBank Weiyedai-Global — 2026 Shenzhen International FinTechathon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F4F5F7] text-[#2D3135] antialiased selection:bg-[#FF5C00] selection:text-white">
        {children}
      </body>
    </html>
  );
}
