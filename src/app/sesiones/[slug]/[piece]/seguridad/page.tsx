import { PasswordForm } from "@/components/organismo/password-form";
import { PasswordSaved } from "@/components/organismo/password-saved";
import { requirePieceOwner } from "@/lib/sessions/require-session";

export const instant = false;

export default async function SeguridadPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; piece: string }>;
  searchParams: Promise<{ error?: string; listo?: string }>;
}) {
  const { slug, piece } = await params;
  const { owner } = await requirePieceOwner(slug, piece);
  const query = await searchParams;
  return (
    <div className="grid max-w-md gap-6">
      <header className="grid gap-2">
        <h1 className="text-h2 text-ink">Seguridad</h1>
        <p className="text-body text-ink-secondary">Cambia la contraseña de esta cuenta.</p>
      </header>
      {query.listo === "1" ? <PasswordSaved /> : null}
      <PasswordForm sector={owner.slug} error={query.error} />
    </div>
  );
}
