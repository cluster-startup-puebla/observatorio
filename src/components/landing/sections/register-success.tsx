import Link from "next/link";
import { successCopy } from "@/components/landing/sections/register-form-model";

function SuccessLinks({ quietClassName }: { quietClassName: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-small">
      <Link href="/login" className="text-link">
        Entrar
      </Link>
      <Link href="/verificar" className={quietClassName}>
        Revisar confirmación
      </Link>
    </div>
  );
}

export function RegisterSuccess({
  variant,
  downloadDiagnostic,
  downloadError,
}: {
  variant: "band" | "page";
  downloadDiagnostic: boolean;
  downloadError: string;
}) {
  const note = downloadDiagnostic && !downloadError ? " El diagnóstico integral se está descargando." : "";

  if (variant === "band") {
    return (
      <section id="registro" className="scroll-mt-24 band-ink py-20 lg:py-28">
        <div className="container-site max-w-2xl">
          <h2 className="text-h2 text-balance">Tu lugar quedó solicitado.</h2>
          <p className="text-body-lg band-ink-muted mt-4">
            {successCopy}
            {note}
          </p>
          {downloadError ? <p className="text-small text-mark mt-3">{downloadError}</p> : null}
          <div className="mt-6">
            <SuccessLinks quietClassName="band-ink-muted underline underline-offset-4" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-4 text-ink">
      <h2 className="text-h2 text-balance">Tu lugar quedó solicitado.</h2>
      <p className="text-body-lg text-ink-secondary">
        {successCopy}
        {note}
      </p>
      {downloadError ? <p className="text-small text-mark">{downloadError}</p> : null}
      <SuccessLinks quietClassName="text-ink-muted underline underline-offset-4" />
    </div>
  );
}
