import { DocTable } from "@/components/diagnostico/doc-table";
import { Section } from "@/components/diagnostico/tmec/doc-section";

export function Informacion() {
  return (
      <Section id="informacion" number="06" title="Información necesaria para diseñar la estrategia">
        <p>
          La estadística pública describe la estructura de la economía, pero no indica qué compra
          puede regionalizarse, qué inversión está detenida ni qué empresa está lista para un
          contrato. Diseñar una estrategia con impacto exige información que solo las empresas pueden
          aportar, organizada para tomar decisiones.
        </p>
        <DocTable
          label="Tabla 3"
          title="Información que debe construirse con las empresas"
          columns={["Información", "Por qué es indispensable", "Decisión que permite"]}
          rows={[
            [
              "Exposición real a Norteamérica, directa e indirecta",
              "La mayoría de las pymes está expuesta por vía indirecta, que no aparece en la estadística oficial",
              "Dirigir la asistencia comercial y documental a quien la necesita",
            ],
            [
              "Insumos importados críticos y su posible sustitución",
              "El arancel estadounidense premia el contenido de la región y de EE. UU.",
              "Detectar proveeduría regional y oportunidades de inversión",
            ],
            [
              "Preparación para cumplir reglas de origen y laborales",
              "Las exigencias se trasladan por contrato a proveedores pequeños",
              "Priorizar apoyo en trazabilidad, origen y cumplimiento",
            ],
            [
              "Inversiones detenidas y su condición crítica",
              "La inversión extranjera de 2024 fue casi toda reinversión",
              "Destrabar proyectos con acciones públicas específicas",
            ],
            [
              "Costo y urgencia de los obstáculos",
              "La planeación documenta restricciones sin cuantificarlas",
              "Ordenar prioridades por materialidad, no por percepción",
            ],
            [
              "Capacidad para atender nuevos contratos",
              "Pocas pymes están listas para homologarse",
              "Seleccionar empresas para programas de proveeduría",
            ],
            [
              "Necesidades de talento y financiamiento",
              "Desajuste entre formación y vacantes; bajo acceso a crédito",
              "Diseñar formación y productos financieros a la medida",
            ],
            [
              "Interés y evidencia de demanda en otros mercados",
              "El interés por un país no demuestra una oportunidad rentable",
              "Seleccionar empresas y destinos para misiones comerciales",
            ],
          ]}
          source="Fuente: elaboración de VIA Partners con base en el diagnóstico."
        />
        <p>
          Esta información debe levantarse por industria y por municipio del establecimiento, con
          fuente y fecha, y mantenerse en un observatorio que se actualice periódicamente. Sin ella,
          cualquier estrategia corre el riesgo de diseñarse para el promedio y no para las empresas
          que realmente pueden crecer o están en riesgo.
        </p>
      </Section>
  );
}
