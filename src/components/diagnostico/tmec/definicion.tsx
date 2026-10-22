import { ReportBanner } from "@/components/diagnostico/report-banner";
import { Kicker } from "@/components/landing/atoms/kicker";

const stats = [
  { value: "$1.18 billones", label: "PIB 2024 a precios corrientes; +3.5% real" },
  { value: "+5.3%", label: "Actividad industrial 1T-2026, tras −3.6% en 2025" },
  { value: "+21.7%", label: "Exportaciones del primer semestre de 2026" },
  { value: "81.6%", label: "Peso del equipo de transporte en las exportaciones de 2025" },
  { value: "70.3%", label: "Informalidad laboral, 2T-2026" },
  { value: "97.1%", label: "Unidades económicas que son micronegocios" },
  { value: "73.3%", label: "Valor agregado censal en solo seis municipios" },
  { value: "≈19%", label: "Arancel efectivo de EE. UU. a vehículos mexicanos" },
];

export function Definicion() {
  return (
      <section id="definicion" className="doc-section scroll-mt-24 py-10 sm:py-16 lg:py-20">
        <div className="container-site doc-wrap grid gap-6 sm:gap-8">
          <header>
            <Kicker>Resumen ejecutivo</Kicker>
            <h2 className="text-h2 mt-3 text-balance text-ink">Puebla en un momento de definición</h2>
          </header>
          <div className="doc-prose grid gap-6 text-ink-secondary sm:gap-8">
          <p className="text-body-lg">
            Puebla llega a la revisión del T-MEC con una plataforma industrial de clase mundial y, al
            mismo tiempo, con una base empresarial que en su mayoría no participa de ella. Las reglas
            que sostienen la integración con Norteamérica están en discusión, los aranceles de Estados
            Unidos ya cambiaron las condiciones de acceso para la industria automotriz y la inversión
            se ha vuelto cautelosa. Lo que se decida en los próximos meses tendrá consecuencias para
            el empleo, los salarios y el desarrollo de todas las regiones del estado.
          </p>
          <ul className="doc-wide grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <li key={stat.value} className="bg-surface p-5">
                <p className="font-display text-h3 text-ink">{stat.value}</p>
                <p className="mt-2 text-body leading-relaxed text-ink-secondary">{stat.label}</p>
              </li>
            ))}
          </ul>
          <p>
            Este resumen sintetiza el diagnóstico de la economía poblana, identifica los principales
            retos y oportunidades, señala la información que hace falta para decidir y propone una
            estrategia en tres ejes: cuidar la base productiva existente, mejorar la productividad y
            la calidad del empleo, y posicionar a Puebla en Norteamérica y en otros mercados.
          </p>
          <aside className="bg-surface-subtle p-6 sm:p-8">
            <Kicker>Mensaje central</Kicker>
            <p className="text-body-lg mt-4 text-ink">
              El riesgo inmediato no es la terminación del T-MEC, sino una etapa prolongada de
              incertidumbre que se transmite a miles de empresas que nunca han exportado
              directamente. La respuesta debe ser una estrategia estatal construida desde la realidad
              de esas empresas.
            </p>
          </aside>
          <ReportBanner />
          </div>
        </div>
      </section>
  );
}
