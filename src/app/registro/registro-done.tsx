import Link from "next/link";
import { Mail } from "lucide-react";

export function RegistroDone({ sector, invitacion }: { sector?: string; invitacion?: string }) {
  const query = new URLSearchParams();
  if (sector) query.set("sector", sector);
  if (invitacion) query.set("invitacion", invitacion);
  const access = query.size ? `/crear-cuenta?${query}` : "/crear-cuenta";

  return (
    <div className="mx-auto grid max-w-sm justify-items-center gap-3 text-center">
      <span className="mb-2 grid size-20 place-items-center rounded-full bg-brand/10 text-brand">
        <Mail className="size-10" aria-hidden />
      </span>
      <h2 className="text-h4 text-ink">Quedó registrado</h2>
      <p className="text-body text-balance text-ink">
        Cuando confirmen tu lugar te llega el pase por correo, con o sin cuenta.
      </p>
      <p className="text-small text-ink-secondary">Si no lo ves, revisa spam.</p>
      <p className="text-small mt-4 text-ink-secondary">
        ¿Quieres el diagnóstico?{" "}
        <Link href={access} className="text-link">
          Crea acceso
        </Link>{" "}
        o{" "}
        <Link href="/login" className="text-link">
          inicia sesión
        </Link>
        .
      </p>
    </div>
  );
}
