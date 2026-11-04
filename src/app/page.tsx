import type { Metadata } from "next";
import { EventLanding } from "@/components/landing/event-landing";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { pageMetadata, siteDescription, siteName } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: siteName,
  description: siteDescription,
  path: "/",
  absolute: true,
});

export default async function Home() {
  await redirectIfSession("/");
  return <EventLanding />;
}
