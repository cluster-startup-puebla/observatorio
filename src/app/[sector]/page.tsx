import type { Metadata } from "next";

export const instant = false;
import { LandingBody } from "@/components/landing/landing-body";
import { OrgHome } from "@/components/organismo/home";
import { getDirectory } from "@/lib/memory-directory";
import { pageMetadata, siteDescription, siteName } from "@/lib/metadata";
import { ownerBySlug } from "@/lib/organismo/owner";
import { resolveSector } from "@/lib/sectors";

const namedSearchKeys = new Set([
  "cuenta",
  "codigo",
  "completas",
  "descarga",
  "enlace",
  "enviado",
  "error",
  "estatus",
  "nombre",
  "persona",
  "pregunta",
  "ref",
  "rol",
  "sector",
  "ver",
]);

function eventToken(searchParams: { [key: string]: string | string[] | undefined }) {
  for (const key of Object.keys(searchParams)) {
    if (!key || namedSearchKeys.has(key)) continue;
    return key;
  }
  return null;
}

export const metadata: Metadata = pageMetadata({
  title: siteName,
  description: siteDescription,
  path: "/",
});

export default async function SectorPage({
  params,
  searchParams,
}: {
  params: Promise<{ sector: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { sector } = await params;
  const owner = await ownerBySlug(sector);
  if (owner) return <OrgHome slug={owner.slug} name={owner.name} />;
  const token = eventToken(await searchParams);
  const brand = token ? await getDirectory().brandForToken(token) : null;
  const resolved = resolveSector({ pathSector: sector });
  const message = resolved.slug ? await getDirectory().sectorMessage(resolved.slug) : null;
  const reserveHref = resolved.slug ? `/register?sector=${resolved.slug}` : "/register";
  return (
    <LandingBody reserveHref={reserveHref} selected={resolved.name} brand={brand} message={message} />
  );
}
