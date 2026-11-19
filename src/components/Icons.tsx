import type { ReactNode } from "react";

export type IconName =
  | "grid"
  | "command"
  | "chart"
  | "shield"
  | "shieldAlert"
  | "users"
  | "store"
  | "arrowRight"
  | "arrowUpRight"
  | "check"
  | "bolt"
  | "lock"
  | "play"
  | "stop"
  | "volume"
  | "chevronDown"
  | "fileText"
  | "cloudRain"
  | "fingerprint"
  | "refresh"
  | "sliders"
  | "menu"
  | "close";

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    grid: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
      </>
    ),
    command: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <path d="M7.5 9h9M7.5 13h5.5M7.5 17h3.5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 4v16h16" />
        <path d="m7.5 15.5 3.8-4.5 3.4 2.6 4.8-6.6" />
      </>
    ),
    shield: (
      <>
        <path d="M12 21.5s7.5-3.8 7.5-9.6V5.4L12 2.5 4.5 5.4v6.5c0 5.8 7.5 9.6 7.5 9.6Z" />
        <path d="m9 12 2.1 2.1 4.2-4.2" />
      </>
    ),
    shieldAlert: (
      <>
        <path d="M12 21.5s7.5-3.8 7.5-9.6V5.4L12 2.5 4.5 5.4v6.5c0 5.8 7.5 9.6 7.5 9.6Z" />
        <path d="M12 8.2v4.6" />
        <circle cx="12" cy="15.8" r="0.8" fill="currentColor" stroke="none" />
      </>
    ),
    users: (
      <>
        <path d="M15.5 20v-1.8a3.7 3.7 0 0 0-3.7-3.7H6.7A3.7 3.7 0 0 0 3 18.2V20" />
        <circle cx="9.2" cy="7.5" r="3.5" />
        <path d="M21 20v-1.8a3.6 3.6 0 0 0-2.7-3.5M15.5 4.2a3.5 3.5 0 0 1 0 6.7" />
      </>
    ),
    store: (
      <>
        <path d="M3.5 10h17" />
        <path d="m5.2 4.5-1.7 5.5a2.8 2.8 0 0 0 5.6 0 2.8 2.8 0 0 0 5.6 0 2.8 2.8 0 0 0 5.6 0l-1.7-5.5Z" />
        <path d="M5.5 12.8V20h13v-7.2" />
      </>
    ),
    arrowRight: (
      <>
        <path d="M4.5 12h15" />
        <path d="m13.5 6 6 6-6 6" />
      </>
    ),
    arrowUpRight: (
      <>
        <path d="M7 17 17 7" />
        <path d="M8.5 7H17v8.5" />
      </>
    ),
    check: <path d="m5 12.5 4.2 4.2L19 7" />,
    bolt: <path d="M13 2.5 4.8 13.2h6.6l-.9 8.3 8.7-10.9h-6.6L13 2.5Z" />,
    lock: (
      <>
        <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
        <path d="M8.2 10.5V7.3a3.8 3.8 0 0 1 7.6 0v3.2" />
      </>
    ),
    play: <path d="m8.5 6.5 9 5.5-9 5.5V6.5Z" fill="currentColor" stroke="none" />,
    stop: <rect x="7.5" y="7.5" width="9" height="9" rx="1.5" fill="currentColor" stroke="none" />,
    volume: (
      <>
        <path d="M11 5.5 6.8 9H4v6h2.8L11 18.5v-13Z" />
        <path d="M15.2 8.8a4.5 4.5 0 0 1 0 6.4M18 6.3a8 8 0 0 1 0 11.4" />
      </>
    ),
    chevronDown: <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />,
    fileText: (
      <>
        <path d="M14 3.5H6.5A2 2 0 0 0 4.5 5.5v13a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9L14 3.5Z" />
        <path d="M14 3.5V9h5.5M8.5 13h7M8.5 16.5h5" />
      </>
    ),
    cloudRain: (
      <>
        <path d="M16.5 15.5a3.8 3.8 0 0 0 .6-7.5 5.3 5.3 0 0 0-10.3 1.2 3.5 3.5 0 0 0 .5 6.9" />
        <path d="m9 16.5-1.2 3.5M13 16.5l-1.2 3.5M17 16.5l-1.2 3.5" />
      </>
    ),
    fingerprint: (
      <>
        <path d="M7.5 11a4.5 4.5 0 0 1 9 0c0 3.2-.8 6.1-2.3 8.5" />
        <path d="M12 11v3.5c0 2-.5 3.8-1.4 5.5" />
        <path d="M4.8 9.5a7.5 7.5 0 0 1 14.4 1.5c0 2.2-.3 4.2-1 6" />
        <path d="M9.5 18.8c.6-1.8.9-3.7.9-5.8" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.4-4.7L4 8" />
        <path d="M4 4v4h4" />
        <path d="M4 13a8 8 0 0 0 14.4 4.7L20 16" />
        <path d="M20 20v-4h-4" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 7h9M17 7h3M15 5v4M4 12h3M11 12h9M9 10v4M4 17h11M19 17h1M17 15v4" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
