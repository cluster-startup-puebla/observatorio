import type { Metadata, Viewport } from "next";
import { Archivo, Raleway } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { SiteFrame } from "@/components/site/site-frame";
import { rootMetadata } from "@/lib/metadata";
import { publicOrigin } from "@/lib/public-origin";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "800"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const themeScript = `(function(){try{var t=localStorage.getItem("observatorio-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`;

export async function generateMetadata(): Promise<Metadata> {
  const origin = await publicOrigin();
  if (!origin) return rootMetadata;
  const image = new URL("/opengraph-image", origin).toString();
  return {
    ...rootMetadata,
    metadataBase: origin,
    openGraph: { ...rootMetadata.openGraph, images: [image] },
    twitter: { ...rootMetadata.twitter, images: [image] },
  };
}

export const viewport: Viewport = {
  themeColor: "#a71c6f",
};
export const instant = false;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const orgSlug = (await cookies()).get("org-slug")?.value ?? "";
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
        <SiteFrame orgSlug={orgSlug}>{children}</SiteFrame>
        <Toaster />
      </body>
    </html>
  );
}
