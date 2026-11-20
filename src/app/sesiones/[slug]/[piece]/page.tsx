import { PieceView } from "@/components/sessions/piece-view";
import { requirePublicSession } from "@/lib/sessions/require-session";

export const instant = false;

export default async function SessionPiecePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; piece: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug, piece } = await params;
  const session = await requirePublicSession(slug);
  return (
    <PieceView piece={piece} sessionSlug={session.publicSlug} searchParams={await searchParams} />
  );
}
