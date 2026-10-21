import { Kicker } from "@/components/landing/atoms/kicker";
import { can } from "@/lib/access";
import { sendInnovationAction } from "@/lib/flow-actions";
import { getDirectory } from "@/lib/memory-directory";

export const instant = false;

export default async function CorreoPage({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string }>;
}) {
  const params = await searchParams;
  const allowed = can("superadmin", "send_mass_email");
  const count = params.enviado === "1" ? (await getDirectory().outbox()).length : null;

  return (
    <section className="container-site py-10 lg:py-14">
      <div className="grid max-w-xl gap-6">
        <Kicker>Superadmin</Kicker>
        <h1 className="text-h1 text-ink">Innovación abierta</h1>
        <p className="text-body-lg text-ink-secondary">
          El aviso sale solo a quienes ya terminaron el perfil. Queda en la bandeja, sin abrir el correo todavía.
        </p>
        {allowed ? (
          <form action={sendInnovationAction}>
            <button type="submit" className="btn btn-primary">
              Enviar innovación abierta
            </button>
          </form>
        ) : null}
        {count !== null ? (
          <p data-testid="encolados" className="text-body text-ink">
            {count}
          </p>
        ) : null}
      </div>
    </section>
  );
}
