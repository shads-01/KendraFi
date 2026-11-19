import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KendraFi | Zero-Trust Multi-Agent SME Finance Protocol",
  description:
    "Zero-Trust Multi-Agent Cooperative Risk and Programmable B2B Escrow Protocol for Bangladesh SME working capital — International AI Builders Congress 2026",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen bg-[#F4EEE6] text-[#241915] font-sans antialiased selection:bg-[#C0502B] selection:text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
