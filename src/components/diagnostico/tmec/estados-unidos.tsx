import { DocChart } from "@/components/diagnostico/doc-chart";
import { Section } from "@/components/diagnostico/tmec/doc-section";

export function EstadosUnidos() {
  return (
      <Section id="estados-unidos" number="02" title="Puebla y Estados Unidos">
        <p>
          El vínculo con Estados Unidos opera por cuatro canales: la exportación directa de
          mercancías (17,027 millones de dólares en 2025), la proveeduría indirecta de empresas que
          venden a quien exporta, las remesas (3,426 millones de dólares, octavo lugar nacional) y la
          inversión, mayoritariamente alemana. A escala nacional, 83.0% de las exportaciones
          mexicanas se dirige a Estados Unidos.
        </p>
        <DocChart
          src="/diagnostico/grafica-3.png"
          caption="Gráfica 3. Exportaciones de mercancías de Puebla, 2015–2025."
          alt="Gráfica 3. Exportaciones de mercancías de Puebla. Serie anual de 2015 a 2025, con pico de 19.8 mil millones en 2022 y 17.0 en 2025, y el primer semestre de 2026 en +21.7%."
          width={990}
          height={413}
        />
        <p>
          La concentración es la característica decisiva: el equipo de transporte explicó 81.6% de lo
          exportado en 2025 y cayó 12.4%, mientras alimentos (+7.0%) y el resto de los subsectores
          (+7.5%) crecieron. En 2026 el ajuste automotriz se volvió visible: Volkswagen produjo 12.2%
          menos en 2025, eliminó un turno en agosto de 2026 y el empleo formal manufacturero llegó a
          su nivel más bajo para un mes de junio desde 2021.
        </p>
        <DocChart
          src="/diagnostico/grafica-4.png"
          caption="Gráfica 4. Arancel de Estados Unidos a vehículos ligeros, por origen."
          alt="Gráfica 4. Arancel estadounidense a vehículos ligeros por origen. México sin cumplir el T-MEC paga 27.5%; con el tratado, la tasa efectiva estimada es 19%, frente a 15% de Japón, Corea del Sur y la Unión Europea."
          width={1087}
          height={353}
        />
        <p>
          Desde 2025, los vehículos mexicanos pagan en Estados Unidos un arancel de 25% sobre su
          contenido no estadounidense, con una tasa efectiva cercana a 19%, por encima del 15%
          pactado con Japón, Corea del Sur y la Unión Europea. El esquema premia el contenido
          estadounidense, no el regional, lo que presiona directamente a los proveedores poblanos. A
          esto se suman los aranceles de 50% al acero y al aluminio, las medidas a muebles y madera,
          y un mecanismo laboral que ya alcanzó a instalaciones en Puebla.
        </p>
      </Section>
  );
}
