import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kali — start a call, no fuss",
  description:
    "Kali is a friendly video call app with instant rooms, guest links, live chat that saves, and host controls. No downloads, no drama.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
