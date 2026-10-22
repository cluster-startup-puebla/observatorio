import type { Metadata } from "next";
import { Archivo, Raleway } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { SiteFrame } from "@/components/site/site-frame";
import { rootMetadata } from "@/lib/metadata";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
  axes: ["wdth"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const themeScript = `(function(){try{var t=localStorage.getItem("observatorio-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`;

export const metadata: Metadata = rootMetadata;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${archivo.variable} ${raleway.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface text-ink">
        <Script id="observatorio-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <SiteFrame>{children}</SiteFrame>
        <Toaster />
      </body>
    </html>
  );
}
