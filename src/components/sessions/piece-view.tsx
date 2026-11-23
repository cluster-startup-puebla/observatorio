import { notFound } from "next/navigation";
import { OrgPiece } from "@/components/sessions/org-piece";
import { SectorPiece } from "@/components/sessions/sector-piece";
import { ownerBySlug } from "@/lib/organismo/owner";
import { pieceKind } from "@/lib/sessions/resolve-piece";
import { resolveSector } from "@/lib/sectors";

type Search = { [key: string]: string | string[] | undefined };

export async function PieceView({
  piece,
  sessionSlug,
  searchParams,
}: {
  piece: string;
  sessionSlug: string;
  searchParams: Search;
}) {
  const owner = await ownerBySlug(piece);
  const sector = resolveSector({ pathSector: piece });
  const kind = pieceKind({
    owner: Boolean(owner),
    sector: Boolean(sector.slug && sector.name),
  });
  if (kind === "organismo" && owner) {
    return <OrgPiece owner={owner} sessionSlug={sessionSlug} searchParams={searchParams} />;
  }
  if (kind === "sector" && sector.slug && sector.name) {
    return (
      <SectorPiece
        name={sector.name}
        slug={sector.slug}
        sessionSlug={sessionSlug}
        searchParams={searchParams}
      />
    );
  }
  notFound();
}
