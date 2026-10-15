import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { pains } from "@/content/landing";

export function Problem() {
  return (
    <section id="problema" className="scroll-mt-24 container-site py-20 lg:py-28">
      <SectionHeading title="Cada empresa resuelve sola lo que todo el sector padece." />
      <p className="text-body mt-6 max-w-3xl text-ink-secondary">
        Durante años, la industria poblana ha resuelto sus problemas tecnológicos de forma aislada.
        Cada empresa negocia por su cuenta, cada proveedor vende lo que ya tiene, y nadie registra
        qué necesita realmente cada sector. Resultado: los emprendedores construyen soluciones para
        problemas obvios y saturados, mientras los problemas de fondo, los que llevas años cargando
        porque nadie te los resuelve bien, siguen sin atención.
      </p>
      <ul className="mt-10 max-w-3xl divide-y divide-line border-y border-line">
        {pains.map((pain) => (
          <li key={pain} className="text-body py-5 text-ink">
            {pain}
          </li>
        ))}
      </ul>
      <p className="text-h4 mt-8 max-w-2xl text-ink">
        Si nadie documenta el problema, nadie lo resuelve. Esto es lo que cambia.
      </p>
    </section>
  );
}
