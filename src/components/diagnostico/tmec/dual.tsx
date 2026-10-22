import { DocChart } from "@/components/diagnostico/doc-chart";
import { Section } from "@/components/diagnostico/tmec/doc-section";

export function Dual() {
  return (
      <Section id="dual" number="01" title="Diagnóstico: una economía dual">
        <p>
          Puebla combina un núcleo industrial exportador de gran escala, articulado alrededor de
          Volkswagen y Audi, con una base extensa de micronegocios, comercio y autoempleo de baja
          productividad. El primero genera la mayor parte del valor, las exportaciones y la inversión
          extranjera; la segunda sostiene la mayor parte del empleo y del territorio. El reto no es
          elegir entre ambos, sino aumentar la transmisión de productividad del núcleo exportador
          hacia proveedores, regiones y trabajadores.
        </p>
        <DocChart
          src="/diagnostico/grafica-1.png"
          caption="Gráfica 1. Unidades, empleo y valor por tamaño de empresa."
          alt="Gráfica 1. Peso de cada estrato de tamaño en unidades, empleo y valor. Los micronegocios son 97.1% de las unidades y 22.0% del valor; las grandes son 0.1% de las unidades y 40.6% del valor."
          width={930}
          height={457}
        />
        <ul className="grid gap-4">
          <li>
            <strong className="text-ink">Coyuntura en recuperación, no consolidada.</strong> La
            economía creció apenas 0.1% en 2025 porque la industria cayó 3.6%; en el primer trimestre
            de 2026 la industria rebotó 5.3% y las exportaciones del primer semestre crecieron 21.7%.
            El repunte parte de una base débil y descansa en pocas plantas.
          </li>
          <li>
            <strong className="text-ink">Más empleo, pero no mejor empleo.</strong> La desocupación
            bajó a 1.8%, pero siete de cada diez personas trabajan en la informalidad y la proporción
            en condiciones críticas subió a 46.1%. La manufactura perdió 5,810 ocupados en un año.
          </li>
          <li>
            <strong className="text-ink">Brecha de productividad.</strong> Los micronegocios son
            97.1% de las unidades y generan 22.0% del valor; las grandes unidades son 0.1% y generan
            40.6%. Una persona en una gran empresa produce cerca de siete veces el valor de una en un
            micronegocio.
          </li>
          <li>
            <strong className="text-ink">Concentración territorial.</strong> Puebla, Cuautlancingo y
            San José Chiapa concentran 59.4% del valor agregado; las sierras y la Mixteca tienen
            alrededor de 36 unidades económicas por cada mil habitantes, frente a 47 en Angelópolis.
          </li>
        </ul>
        <DocChart
          src="/diagnostico/grafica-2.png"
          caption="Gráfica 2. Variación anual de la actividad por gran sector."
          alt="Gráfica 2. Variación anual de la actividad económica por gran sector. La industria pasó de −6.3% en el tercer trimestre de 2025 a +5.3% en el primero de 2026."
          width={925}
          height={525}
        />
      </Section>
  );
}
