import { notFound } from "next/navigation";
import { InviteModes } from "@/components/organismo/invite-modes";
import { ownerBySlug } from "@/lib/organismo/owner";

export const instant = false;

export default async function InvitacionesPage({
  params,
  searchParams,
}: {
  params: Promise<{ sector: string }>;
  searchParams: Promise<{ error?: string; modo?: string }>;
}) {
  const { sector } = await params;
  const owner = await ownerBySlug(sector);
  if (!owner) notFound();
  const query = await searchParams;
  return (
    <div className="grid max-w-3xl gap-6">
      <header className="grid gap-2">
        <h1 className="text-h2 text-ink">Invitaciones</h1>
        <p className="text-body text-ink-secondary">Tres formas de invitar. Elige una.</p>
      </header>
      <InviteModes slug={owner.slug} mode={query.modo ?? "mano"} error={query.error} />
    </div>
  );
}
