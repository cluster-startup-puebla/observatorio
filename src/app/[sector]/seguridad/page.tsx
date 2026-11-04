import { notFound } from "next/navigation";
import { PasswordForm } from "@/components/organismo/password-form";
import { PasswordSaved } from "@/components/organismo/password-saved";
import { ownerBySlug } from "@/lib/organismo/owner";

export const instant = false;

export default async function SeguridadPage({
  params,
  searchParams,
}: {
  params: Promise<{ sector: string }>;
  searchParams: Promise<{ error?: string; listo?: string }>;
}) {
  const { sector } = await params;
  const owner = await ownerBySlug(sector);
  if (!owner) notFound();
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
