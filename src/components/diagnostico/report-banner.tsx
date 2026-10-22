import Link from "next/link";
import { diagnosticRegisterHref } from "@/content/diagnostico-tmec";

export function ReportBanner() {
  return (
    <aside className="report-banner flex flex-col gap-4 border border-line bg-surface-subtle p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="grid gap-1">
        <p className="text-h4 text-ink">Si quieres el reporte integral, regístrate.</p>
        <p className="text-body text-ink-secondary">
          Al terminar el registro se descarga el diagnóstico de VIA Partners, el de 82 páginas.
        </p>
      </div>
      <Link href={diagnosticRegisterHref} className="btn btn-primary w-full shrink-0 sm:w-auto">
        Registrarme y descargar
      </Link>
    </aside>
  );
}
