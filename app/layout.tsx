import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { RouteTransition } from "@/components/ui/route-transition";
import { DesktopNav } from "@/components/desktop/desktop-nav";
import { appBaseUrl } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl()),
  title: "Kali · start a call, no fuss",
  description:
    "Kali is a friendly video call app with instant rooms, guest links, live chat that saves, and host controls. No downloads, no drama.",
  openGraph: {
    siteName: "Kali",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffa8cd",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Script id="kali-theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem("kali-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#000000":"#ffa8cd");if(/Electron\\//.test(navigator.userAgent))document.documentElement.setAttribute("data-kali-desktop","true")}catch(e){}`}
        </Script>
        <RouteTransition>{children}</RouteTransition>
        <DesktopNav fixed />
        <Analytics />
      </body>
    </html>
  );
}
