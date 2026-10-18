import type { Metadata } from "next";
import { DocChart } from "@/components/diagnostico/doc-chart";
import { DocTable } from "@/components/diagnostico/doc-table";
import { ReadingDock, ReadingToggle } from "@/components/diagnostico/reading-dock";
import { ReportBanner } from "@/components/diagnostico/report-banner";
import { Kicker } from "@/components/landing/atoms/kicker";
import { diagnosticRegisterHref } from "@/content/diagnostico-tmec";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Puebla ante el T-MEC",
  description:
    "Análisis de VIA Partners para Puebla x Puebla. Resumen del diagnóstico ante el T-MEC, con las gráficas del documento.",
  path: "/diagnostico-tmec-puebla",
});

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

const contents = [
  { href: "#definicion", label: "Puebla en un momento de definición" },
  { href: "#dual", label: "01 · Diagnóstico: una economía dual" },
  { href: "#estados-unidos", label: "02 · Puebla y Estados Unidos" },
  { href: "#industrias", label: "03 · Las 14 industrias frente al T-MEC" },
  { href: "#tratados", label: "04 · Más allá del T-MEC" },
  { href: "#retos", label: "05 · Retos y oportunidades" },
  { href: "#informacion", label: "06 · Información necesaria para diseñar la estrategia" },
  { href: "#estrategia", label: "07 · Estrategia: cuidar, mejorar y posicionar" },
];

function IndexList() {
  return (
    <ol className="mt-2 grid gap-1 md:mt-4 md:grid-cols-2">
      {contents.map((item) => (
        <li key={item.href}>
          <a href={item.href} className="flex min-h-11 items-center text-body text-link md:min-h-10">
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  );
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="doc-section scroll-mt-24 border-t border-line py-10 sm:py-16 lg:py-20">
      <div className="container-site doc-wrap grid gap-6 sm:gap-8">
        <header>
          <Kicker>Sección {number}</Kicker>
          <h2 className="text-h2 mt-3 text-balance text-ink">{title}</h2>
        </header>
        <div className="doc-prose grid gap-6 text-ink-secondary sm:gap-8">{children}</div>
      </div>
    </section>
  );
}

export default function DiagnosticoTmecPage() {
  return (
    <article className="doc-page">
      <ReadingDock sections={contents} />
      <header className="border-b border-line">
        <div className="container-site doc-wrap grid gap-6 py-10 sm:gap-8 sm:py-16 lg:py-24">
          <Kicker>Resumen ejecutivo · Octubre de 2026</Kicker>
          <div className="grid gap-4">
            <h1 className="max-w-4xl text-balance text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.03em] text-ink">
              Puebla ante el T-MEC
            </h1>
            <p className="text-body-lg max-w-3xl text-ink-secondary">
              Diagnóstico, retos, oportunidades y estrategia para posicionar, fortalecer y proteger
              la economía poblana.
            </p>
          </div>
          <div className="max-w-3xl border-l-2 border-brand pl-5">
            <p className="text-micro uppercase text-ink-muted">De quién es este análisis</p>
            <p className="text-h3 mt-2 text-ink">VIA Partners</p>
            <p className="mt-2 text-body text-ink-secondary">
              Elaborado para Puebla x Puebla. Corte al 16 de octubre de 2026.
            </p>
          </div>
          <div className="doc-hero-actions flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#definicion" className="btn btn-primary w-full sm:w-auto">
              Leer el resumen
            </a>
            <a href={diagnosticRegisterHref} className="btn btn-secondary w-full sm:w-auto">
              Registrarme y descargar
            </a>
            <ReadingToggle prominent />
          </div>
        </div>
      </header>

      <nav aria-label="Contenido del documento" className="doc-index border-b border-line bg-surface-subtle">
        <div className="container-site doc-wrap py-4 sm:py-8">
          <details className="md:hidden">
            <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 text-body font-semibold text-ink">
              En este documento
              <span aria-hidden="true" className="doc-index-mark text-ink-muted" />
            </summary>
            <IndexList />
          </details>
          <div className="hidden md:block">
            <Kicker>En este documento</Kicker>
            <IndexList />
          </div>
        </div>
      </nav>

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
    </article>
  );
}
