import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";
/* Scrape WP blocks first; globals (tokens + new chrome) always wins after. */
import "@/styles/scrape.css";
import "./globals.css";

/** Interim brand face — self-hosted via next/font (no Google runtime CSS). */
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: site.tagline,
  icons: {
    icon: "/wp-content/uploads/2023/08/cropped-pertyon-wide-1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceMono.variable}>
      <body>
        <div className="wp-site-blocks">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
