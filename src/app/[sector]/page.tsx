import type { Metadata } from "next";

export const instant = false;
import { LandingBody } from "@/components/landing/landing-body";
import { pageMetadata, siteDescription, siteName } from "@/lib/metadata";
import { resolveSector } from "@/lib/sectors";

export const metadata: Metadata = pageMetadata({
  title: siteName,
  description: siteDescription,
  path: "/",
});

export default async function SectorPage({ params }: { params: Promise<{ sector: string }> }) {
  const { sector } = await params;
  const resolved = resolveSector({ pathSector: sector });
  const reserveHref = resolved.slug ? `/register?sector=${resolved.slug}` : "/register";
  return <LandingBody reserveHref={reserveHref} selected={resolved.name} />;
}
