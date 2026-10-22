import { DocChart } from "@/components/diagnostico/doc-chart";
import { DocTable } from "@/components/diagnostico/doc-table";
import { Section } from "@/components/diagnostico/tmec/doc-section";

export function Tratados() {
  return (
      <Section id="tratados" number="04" title="Más allá del T-MEC">
        <p>
          México tiene 14 tratados de libre comercio con 52 países, pero su diversificación comercial
          es limitada: la Unión Europea recibe 3.6% de las exportaciones, Canadá 3.3% y China 1.5%.
          Ningún mercado sustituye a Estados Unidos, pero algunos acuerdos son relevantes para
          industrias poblanas concretas.
        </p>
        <DocChart
          src="/diagnostico/grafica-6.png"
          caption="Gráfica 6. Destino de las exportaciones mexicanas en 2025."
          alt="Gráfica 6. Destino de las exportaciones mexicanas en 2025. Estados Unidos recibe 83.0%, el resto del mundo 8.5%, la Unión Europea 3.6%, Canadá 3.3% y China 1.5%."
          width={1083}
          height={363}
        />
        <DocTable
          label="Tabla 1"
          title="Tratados con mayor relevancia para Puebla"
          columns={["Acuerdo", "Por qué importa a Puebla", "Industrias con oportunidad"]}
          rows={[
            [
              "Unión Europea (acuerdo modernizado, firmado en mayo de 2026)",
              "Origen de 41% de la inversión extranjera en Puebla; liberará más de 98.7% de las líneas arancelarias",
              "Automotriz, dispositivos médicos, alimentos con indicación geográfica, química, mueble y minerales no metálicos",
            ],
            [
              "Japón",
              "Uno de los vínculos asiáticos más utilizados por México",
              "Autopartes, maquinaria, carne de cerdo y aguacate",
            ],
            [
              "CPTPP",
              "Mercado en Asia-Pacífico y fuente de insumos con preferencia que sustituyen importaciones de países sin tratado",
              "Plásticos, electrónica, alimentos y autopartes",
            ],
            [
              "Centroamérica, Panamá y Alianza del Pacífico",
              "Mercados cercanos con reglas homologadas",
              "Alimentos, empaque, construcción, logística y servicios digitales",
            ],
          ]}
          source="Fuente: Secretaría de Economía; Comisión Europea; Monex (2026); elaboración de VIA Partners."
        />
        <p>
          Aprovechar estos acuerdos exige más que preferencias arancelarias: requiere cumplir reglas
          de origen distintas, normas sanitarias y técnicas, logística y canales comerciales. Para
          las pymes, el costo fijo de cumplir suele ser la barrera decisiva.
        </p>
      </Section>
  );
}
