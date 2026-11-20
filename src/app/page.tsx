import type { Metadata } from "next";
import { ProgramHome } from "@/components/program/program-home";
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
  return <ProgramHome />;
}
