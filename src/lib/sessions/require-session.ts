import "server-only";

import { notFound } from "next/navigation";
import { ownerBySlug, type OrgOwner } from "@/lib/organismo/owner";
import { sessionBySlug, type PublicSession } from "@/lib/sessions/load-session";

export async function requirePublicSession(publicSlug: string): Promise<PublicSession> {
  const session = await sessionBySlug(publicSlug);
  if (!session) notFound();
  return session;
}

export async function requirePieceOwner(
  publicSlug: string,
  piece: string,
): Promise<{ session: PublicSession; owner: OrgOwner }> {
  const session = await requirePublicSession(publicSlug);
  const owner = await ownerBySlug(piece);
  if (!owner) notFound();
  return { session, owner };
}
