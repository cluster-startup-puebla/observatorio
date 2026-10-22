import { DocChart } from "@/components/diagnostico/doc-chart";
import { ReportBanner } from "@/components/diagnostico/report-banner";
import { Section } from "@/components/diagnostico/tmec/doc-section";

export function Industrias() {
  return (
      <Section id="industrias" number="03" title="Las 14 industrias frente al T-MEC">
        <p>
          El impacto no es uniforme. Automotriz, autopartes y metalmecánica tienen una exposición muy
          alta; dispositivos médicos, textil, plásticos y logística, alta; alimentos y mueble,
          media-alta con riesgos específicos; química y minerales no metálicos, media; construcción,
          artes gráficas, tecnología y turismo dependen del tratado de forma indirecta, a través de
          la inversión, el empleo industrial y el consumo.
        </p>
        <DocChart
          src="/diagnostico/grafica-5.png"
          caption="Gráfica 5. Exposición de las 14 industrias a Estados Unidos."
          alt="Gráfica 5. Mapa de exposición de las 14 industrias a Estados Unidos, por venta directa, proveeduría, insumos, aranceles, reglas de origen, riesgo laboral y requisitos técnicos."
          width={974}
          height={608}
        />
        <p>
          Tres patrones se repiten. Casi todas las industrias manufactureras están expuestas por la
          vía indirecta: no exportan, pero venden a quien exporta y reciben exigencias de origen,
          trazabilidad y cumplimiento laboral sin la escala para atenderlas. La dependencia de
          insumos importados es alta en plásticos, química, metalmecánica y autopartes, lo que abre
          espacio para sustituir importaciones con proveeduría regional. Y alimentos, textil, mueble,
          minerales no metálicos y dispositivos médicos son las industrias con mayor potencial de
          diversificación fuera de la cadena automotriz.
        </p>
        <ReportBanner />
      </Section>
  );
}
