import { Kicker } from "@/components/landing/atoms/kicker";
import { contents } from "@/components/diagnostico/tmec/contents";

function IndexList() {
  return (
    <ol className="mt-2 grid gap-1 md:mt-4 md:grid-cols-2">
      {contents.map((item) => (
        <li key={item.href}>
          <a href={item.href} className="flex min-h-11 items-center text-body text-link md:min-h-10">
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function DocIndex() {
  return (
      <nav aria-label="Contenido del documento" className="doc-index border-b border-line bg-surface-subtle">
        <div className="container-site doc-wrap py-4 sm:py-8">
          <details className="md:hidden">
            <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 text-body font-semibold text-ink">
              En este documento
              <span aria-hidden="true" className="doc-index-mark text-ink-muted" />
            </summary>
            <IndexList />
          </details>
          <div className="hidden md:block">
            <Kicker>En este documento</Kicker>
            <IndexList />
          </div>
        </div>
      </nav>
  );
}
