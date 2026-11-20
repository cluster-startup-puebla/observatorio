import type { Metadata } from "next";
import { MemorySectorPage } from "@/components/landing/memory-sector-page";
import { pageMetadata, siteDescription, siteName } from "@/lib/metadata";
import { redirectLegacyPiece } from "@/lib/sessions/redirect-legacy";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: siteName,
  description: siteDescription,
  path: "/",
});

type Search = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function SectorPage({
  params,
  searchParams,
}: {
  params: Promise<{ sector: string }>;
  searchParams: Search;
}) {
  const { sector } = await params;
  const query = await searchParams;
  if (usesSupabaseAuth()) await redirectLegacyPiece(sector, "", query);
  return <MemorySectorPage sector={sector} searchParams={query} />;
}
