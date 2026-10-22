import { notFound } from "next/navigation";
import { EmailBox } from "@/components/organismo/email-box";
import { InviteUpload } from "@/components/organismo/invite-upload";
import { ManualInvite } from "@/components/organismo/manual-invite";
import { ownerBySlug } from "@/lib/organismo/owner";

export const instant = false;

export default async function InvitacionesPage({
  params,
  searchParams,
}: {
  params: Promise<{ sector: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { sector } = await params;
  const owner = await ownerBySlug(sector);
  if (!owner) notFound();
  const paramsQuery = await searchParams;
  return (
    <div className="grid max-w-3xl gap-8">
      <header className="grid gap-2">
        <h1 className="text-h2 text-ink">Invitaciones</h1>
        <a className="text-small font-semibold text-link" href={`/${owner.slug}/invitaciones/plantilla`}>
          Descargar plantilla
        </a>
      </header>
      <ManualInvite />
      <InviteUpload />
      <EmailBox error={paramsQuery.error} />
    </div>
  );
}
