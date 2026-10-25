import type { Metadata } from "next";
import { EventLanding } from "@/components/landing/event-landing";
import { pageMetadata, siteDescription, siteName } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: siteName,
  description: siteDescription,
  path: "/",
  absolute: true,
});

export default function Home() {
  return <EventLanding />;
}
