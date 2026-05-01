import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Iron Paradise Gym — Forge Your Legacy",
    template: "%s | Iron Paradise",
  },
  description:
    "Mumbai's premier fitness destination. State-of-the-art equipment, expert trainers, and a community that pushes you to your limits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
