import Link from "next/link";
import { Mail } from "lucide-react";

export function RegistroDone({ sector, invitacion }: { sector?: string; invitacion?: string }) {
  const query = new URLSearchParams();
  if (sector) query.set("sector", sector);
  if (invitacion) query.set("invitacion", invitacion);
  const href = query.size ? `/crear-cuenta?${query}` : "/crear-cuenta";

  return (
    <div className="mx-auto grid max-w-sm justify-items-center gap-3 text-center">
      <span className="mb-2 grid size-20 place-items-center rounded-full bg-brand/10 text-brand">
        <Mail className="size-10" aria-hidden />
      </span>
      <h2 className="text-h4 text-ink">Quedó registrado</h2>
      <p className="text-body text-balance text-ink">Pendiente de tu correo. Te llegará un mensaje con tu pase.</p>
      <p className="text-small text-ink-secondary">Si no lo ves, revisa la carpeta de spam.</p>
      <Link href={href} className="btn btn-primary mt-3">
        Crear cuenta
      </Link>
    </div>
  );
}
