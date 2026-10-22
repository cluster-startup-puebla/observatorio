import { DocChart } from "@/components/diagnostico/doc-chart";
import { DocTable } from "@/components/diagnostico/doc-table";
import { Section } from "@/components/diagnostico/tmec/doc-section";

export function Retos() {
  return (
      <Section id="retos" number="05" title="Retos y oportunidades">
        <DocTable
          label="Tabla 2"
          title="Principales retos y oportunidades"
          columns={["Tema", "Reto", "Oportunidad"]}
          rows={[
            [
              "Revisión del T-MEC",
              "Revisiones anuales que posponen inversiones y contratos de largo plazo",
              "Llevar evidencia poblana a la consulta de USTR (cierre: 12 de enero de 2027) y a las mesas de la Secretaría de Economía",
            ],
            [
              "Aranceles de EE. UU.",
              "Tasa efectiva cercana a 19% para vehículos; 50% a acero y aluminio",
              "Sustituir insumos extrarregionales y demostrar contenido regional y estadounidense",
            ],
            [
              "Cadena automotriz",
              "Recorte de turnos, menor producción y presión sobre márgenes de proveedores",
              "Producción del Golf desde 2027; asientos, interiores, plásticos y estampado en expansión",
            ],
            [
              "Productividad",
              "Brecha de siete a uno entre grandes empresas y micronegocios",
              "Programas de proveeduría con compradores identificados y mejora de procesos",
            ],
            [
              "Empleo",
              "Informalidad de 70.3% y empleo en condiciones críticas al alza",
              "Formación ligada a vacantes y formalización a partir de contratos",
            ],
            [
              "Territorio",
              "Valor concentrado en tres municipios; sierras y Mixteca con poco tejido empresarial",
              "Organización de productores, servicios compartidos y polos de desarrollo",
            ],
            [
              "Diversificación",
              "83% de las exportaciones nacionales a un solo mercado",
              "Unión Europea, Japón y CPTPP para alimentos, mueble, minerales y dispositivos médicos",
            ],
            [
              "Condiciones habilitantes",
              "Agua, energía, logística, seguridad y financiamiento",
              "Proyectos de infraestructura por sitio y un producto de garantía con la banca de desarrollo",
            ],
          ]}
          source="Fuente: elaboración de VIA Partners con base en el diagnóstico."
        />
        <DocChart
          src="/diagnostico/grafica-7.png"
          caption="Gráfica 7. Matriz de riesgos de la revisión para Puebla."
          alt="Gráfica 7. Matriz de riesgos de la revisión para Puebla. Aranceles fuera del T-MEC combinan probabilidad alta e impacto muy alto. PyME sin documentación tiene probabilidad alta e impacto medio."
          width={1076}
          height={523}
        />
      </Section>
  );
}
