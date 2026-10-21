import type { Metadata } from "next";
import { LandingBody } from "@/components/landing/landing-body";
import { pageMetadata, siteDescription, siteName } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: siteName,
  description: siteDescription,
  path: "/",
  absolute: true,
});

export default function Home() {
  return <LandingBody />;
}
