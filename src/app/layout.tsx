import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { SiteFrame } from "@/components/site/site-frame";
import { rootMetadata } from "@/lib/metadata";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const themeScript = `(function(){try{var t=localStorage.getItem("observatorio-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`;

export const metadata: Metadata = rootMetadata;
export const instant = false;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const orgSlug = (await cookies()).get("org-slug")?.value ?? "";
  return (
    <html
      lang="es"
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface text-ink">
        <Script id="observatorio-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <SiteFrame orgSlug={orgSlug}>{children}</SiteFrame>
        <Toaster />
      </body>
    </html>
  );
}
