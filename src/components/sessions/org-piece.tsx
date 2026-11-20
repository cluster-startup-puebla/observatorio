import { OrgHome } from "@/components/organismo/home";
import { readInviteLink } from "@/lib/organismo/invite-link-cookie";
import type { OrgOwner } from "@/lib/organismo/owner";

type Search = { [key: string]: string | string[] | undefined };

export async function OrgPiece({
  owner,
  sessionSlug,
  searchParams,
}: {
  owner: OrgOwner;
  sessionSlug: string;
  searchParams: Search;
}) {
  const saved = await readInviteLink(owner.slug);
  const enlace = typeof searchParams.enlace === "string" ? searchParams.enlace : saved?.url;
  const sector = typeof searchParams.sector === "string" ? searchParams.sector : saved?.sector;
  return (
    <OrgHome
      slug={owner.slug}
      sessionSlug={sessionSlug}
      name={owner.name}
      orgId={owner.id}
      url={enlace}
      sector={sector}
      failed={searchParams.error === "enlace"}
      ready={typeof searchParams.enlace === "string"}
      corte={typeof searchParams.corte === "string" ? searchParams.corte : undefined}
      brandColor={owner.brandColor}
    />
  );
}
