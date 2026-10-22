import { ReportBanner } from "@/components/diagnostico/report-banner";
import { DocTable } from "@/components/diagnostico/doc-table";
import { Kicker } from "@/components/landing/atoms/kicker";
import { Section } from "@/components/diagnostico/tmec/doc-section";

export function Estrategia() {
  return (
      <Section id="estrategia" number="07" title="Estrategia: cuidar, mejorar y posicionar">
        <p>
          La estrategia propuesta articula tres ejes con horizontes distintos. El primero protege lo
          que Puebla ya tiene; el segundo eleva la productividad y la calidad del empleo; el tercero
          abre nuevas fuentes de crecimiento. Los tres se apoyan en la misma base de información y en
          la coordinación entre gobierno, cámaras, clústeres, academia y empresas.
        </p>
        <DocTable
          label="Tabla 4"
          title="Ejes de la estrategia"
          columns={["Eje", "Objetivo", "Líneas de acción", "Horizonte"]}
          rows={[
            [
              "Cuidar la base productiva",
              "Reducir el impacto de la revisión y de los aranceles en empresas y empleos",
              "Célula Puebla–T-MEC de monitoreo y alerta regulatoria. Expediente de origen y trazabilidad para proveedores. Prevención laboral en instalaciones exportadoras. Liquidez y capital de trabajo para proveedores afectados.",
              "0–6 meses",
            ],
            [
              "Mejorar la productividad y el empleo",
              "Cerrar la brecha entre el núcleo exportador y el resto de la economía",
              "Desarrollo de proveedores con compradores identificados. Sustitución de insumos extrarregionales. Formación técnica ligada a vacantes. Producto de garantía con Nafin y la banca comercial. Agua, energía y logística por sitio en los polos de desarrollo.",
              "6–18 meses",
            ],
            [
              "Posicionar a Puebla",
              "Diversificar mercados e inversión y fortalecer la voz del estado",
              "Posición poblana documentada ante USTR y la Secretaría de Economía. Misiones comerciales a Europa y plataformas sectoriales en 2027. Aprovechamiento del acuerdo con la UE, Japón y el CPTPP. Atracción de inversión en electromovilidad, electrónica y servicios industriales.",
              "6–36 meses",
            ],
          ]}
          source="Fuente: elaboración de VIA Partners con base en el diagnóstico."
        />
        <div className="grid gap-3">
          <h3 className="text-h4 text-ink">Cómo se mide el avance</h3>
          <ul className="grid list-disc gap-2 pl-5">
            <li>Proveedores poblanos con primera compra verificada y valor de compras locales adicionales.</li>
            <li>Inversión efectivamente ejecutada, separada de los anuncios.</li>
            <li>Empleo formal y salario en las industrias atendidas, por municipio.</li>
            <li>Empresas con expediente de origen completo y casos laborales prevenidos.</li>
            <li>Pedidos piloto y ventas recurrentes en mercados distintos de Estados Unidos.</li>
          </ul>
        </div>
        <div className="grid gap-3">
          <h3 className="text-h4 text-ink">El papel de VIA Partners</h3>
          <p>
            VIA Partners acompaña este proceso con tres capacidades: el diagnóstico de necesidades
            empresariales y su conversión en proyectos; la vinculación de las empresas con mercados,
            compradores y fuentes de financiamiento; y la inteligencia regulatoria para anticipar
            cambios en el T-MEC, en los aranceles y en los requisitos de los compradores. El objetivo
            es que Puebla cuente con una estrategia propia, basada en evidencia, y con la capacidad de
            ejecutarla.
          </p>
        </div>
        <aside className="bg-surface-subtle p-6 sm:p-8">
          <Kicker>Conclusión</Kicker>
          <p className="text-body-lg mt-4 text-ink">
            Puebla tiene la plataforma industrial, la red de tratados y la masa crítica empresarial
            para salir fortalecida de la revisión del T-MEC. Lo que falta es convertir la información
            dispersa en decisiones coordinadas.
          </p>
        </aside>
        <p className="text-body-lg text-ink">
          El día del evento también se hará un análisis de qué tan lista está Puebla para el T-MEC.
        </p>
        <ReportBanner />
      </Section>
  );
}
