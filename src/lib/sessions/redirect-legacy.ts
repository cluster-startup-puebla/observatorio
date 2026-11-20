import "server-only";

import { notFound, redirect } from "next/navigation";
import { ownerBySlug } from "@/lib/organismo/owner";
import { resolveSector } from "@/lib/sectors";
import { legacyPieceHref } from "./legacy-href";
import { listPublicSessions } from "./load-public";

type Query = Record<string, string | string[] | undefined>;

export async function redirectLegacyPiece(piece: string, suffix: string, query: Query) {
  const owner = await ownerBySlug(piece);
  const sector = resolveSector({ pathSector: piece }).slug;
  if (suffix && !owner) notFound();
  if (!owner && !sector) notFound();
  const sessions = await listPublicSessions();
  const current = sessions[0];
  if (!current) notFound();
  redirect(legacyPieceHref(current.publicSlug, piece, suffix, query));
}
