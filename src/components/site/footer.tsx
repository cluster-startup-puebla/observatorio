import Link from "next/link";
import { ClusterMark } from "@/components/program/cluster-mark";
import { clusterEmail, clusterUrl, companyAccountHref } from "@/content/landing";

const links = [
  { label: "El programa", href: "/#programa" },
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Sesiones", href: "/sesiones" },
  { label: "Blog", href: "/blog" },
  { label: "Crear cuenta", href: companyAccountHref },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy py-16 text-white">
      <div className="container-site grid gap-12 md:grid-cols-3">
        <div>
          <Link href="/#inicio" className="font-display text-h4 text-white">
            Observatorio
          </Link>
          <p className="mt-4 text-small text-white/80">Es una iniciativa del</p>
          <a href={clusterUrl} className="mt-3 inline-block text-white" target="_blank" rel="noopener noreferrer">
            <ClusterMark light className="h-16 w-auto" />
          </a>
        </div>
        <div>
          <p className="text-micro uppercase text-white/70">En esta página</p>
          <ul className="mt-3 space-y-2 text-small">
            {links.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-micro uppercase text-white/70">Contacto</p>
          <a href={`mailto:${clusterEmail}`} className="mt-3 inline-block text-small text-white">
            {clusterEmail}
          </a>
        </div>
      </div>
      <div className="container-site mt-12 flex flex-col gap-3 border-t border-white/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-micro text-white/80">© 2026 Observatorio Tecnológico de Puebla</p>
        <p className="text-micro">
          <Link href="/aviso-de-privacidad" className="text-white">
            Aviso de privacidad
          </Link>
          <span className="px-2 text-white/50" aria-hidden>
            ·
          </span>
          <Link href="/uso-de-datos" className="text-white">
            Uso de datos
          </Link>
        </p>
      </div>
    </footer>
  );
}
