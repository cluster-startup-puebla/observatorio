import Link from "next/link";
import { ctaLabel } from "@/content/landing";

export function ReserveBand({ href }: { href: string }) {
  return (
    <section id="registro" className="scroll-mt-24 band-ink py-20">
      <div className="container-site">
        <div className="max-w-2xl">
          <h2 className="text-h2 text-balance">Crea tu cuenta para la sesión.</h2>
          <p className="text-body-lg band-ink-muted mt-4">
            El registro ya cerró. Con tu cuenta entras al pase y al formulario.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={href} className="btn btn-on-dark">
              {ctaLabel}
            </Link>
            <Link href="/login" className="text-small band-ink-muted underline underline-offset-4">
              ¿Ya te registraste? Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
