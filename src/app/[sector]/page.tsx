import type { Metadata } from "next";

export const instant = false;
import { LandingBody } from "@/components/landing/landing-body";
import { OrgHome } from "@/components/organismo/home";
import { getDirectory } from "@/lib/memory-directory";
import { pageMetadata, siteDescription, siteName } from "@/lib/metadata";
import { readInviteLink } from "@/lib/organismo/invite-link-cookie";
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
  const sp = await searchParams;
  const owner = await ownerBySlug(sector);
  if (owner) {
    const saved = await readInviteLink(owner.slug);
    const enlace = typeof sp.enlace === "string" ? sp.enlace : saved?.url;
    const inviteSector = typeof sp.sector === "string" ? sp.sector : saved?.sector;
    return (
      <OrgHome
        slug={owner.slug}
        name={owner.name}
        orgId={owner.id}
        url={enlace}
        sector={inviteSector}
      />
    );
  }
  const token = eventToken(sp);
  const brand = token ? await getDirectory().brandForToken(token) : null;
  const resolved = resolveSector({ pathSector: sector });
  if (token && resolved.slug) {
    const { connection } = await import("next/server");
    await connection();
    await getDirectory().recordOpen({
      token,
      sectorSlug: resolved.slug,
      at: new Date().toISOString(),
    });
  }
  const message = resolved.slug ? await getDirectory().sectorMessage(resolved.slug) : null;
  const reserveHref = resolved.slug ? `/register?sector=${resolved.slug}` : "/register";
  return (
    <LandingBody reserveHref={reserveHref} selected={resolved.name} brand={brand} message={message} />
  );
}
