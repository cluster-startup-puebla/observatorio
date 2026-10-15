import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { Tile } from "@/components/landing/molecules/tile";
import { visionPoints } from "@/content/landing";

export function Vision() {
  return (
    <section id="vision" className="scroll-mt-24 container-site py-20 lg:py-28">
      <SectionHeading title="Puebla va a ser el estado que mide su propia demanda tecnológica." />
      <p className="text-body mt-6 max-w-3xl text-ink-secondary">
        Hoy ningún estado tiene un mapa vivo y actualizado de lo que su industria necesita en
        tecnología. Nosotros lo vamos a construir, con tu participación. El Observatorio no es un
        reporte que se publica una vez y se archiva: se actualiza con cada sesión y cada revisión
        sectorial.
      </p>
      <div className="mt-12 grid gap-px bg-line sm:grid-cols-2">
        {visionPoints.map((point) => (
          <Tile key={point.title} {...point} />
        ))}
      </div>
      <blockquote className="band-ink mt-12 px-6 py-10 lg:px-10">
        <p className="text-h3 max-w-3xl text-balance">
          Lo que se mide, se resuelve. Lo que se comparte, se multiplica. Y quien participa
          primero, se beneficia primero.
        </p>
      </blockquote>
      <p className="text-small mt-8 max-w-3xl text-ink-secondary">
        Todo lo que compartes es confidencial. El Observatorio solo publica hallazgos agregados y
        anónimos por sector. Ningún dato es atribuible a tu empresa.
      </p>
    </section>
  );
}
