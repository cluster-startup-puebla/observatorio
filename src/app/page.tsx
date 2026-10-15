const LINES = [
  "El nombre de lo que se observa",
  "El contexto al lado del dato",
  "Una acción que se ve sin buscarla",
];

const LAYERS = [
  {
    title: "Nombre",
    description: "Lo que se mira lleva un título que se lee de lejos, antes que cualquier adorno.",
  },
  {
    title: "Contexto",
    description: "La explicación vive al lado, en una medida corta, sin competir con el título.",
  },
  {
    title: "Acción",
    description: "El siguiente paso es un botón. El rosa marca esa acción y no pinta el resto.",
  },
];

const STEPS = [
  {
    title: "Pregunta",
    description: "Qué hay que ver, para quién y qué ya está registrado.",
  },
  {
    title: "Contexto",
    description: "La escena alrededor del dato, antes de producir variantes.",
  },
  {
    title: "Registro",
    description: "La pieza queda con estados reales, no con un esquema vacío.",
  },
  {
    title: "Lectura",
    description: "Alguien más puede seguirla sin reinterpretar el color ni la jerarquía.",
  },
];

export default function Home() {
  return (
    <>
      <section id="inicio" className="border-b border-line">
        <div className="container-site grid items-end gap-12 py-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.7fr)] lg:py-28">
          <div>
            <p className="text-micro uppercase text-ink-muted">Observatorio</p>
            <h1 className="text-display mt-4 max-w-4xl text-balance text-ink">Mirar lo que cambia.</h1>
            <p className="text-body-lg mt-6 max-w-xl text-ink-secondary">
              Señales, contexto y el siguiente paso, en una sola lectura. El lienzo es claro. El
              navy escribe. El rosa solo nombra la acción.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#lectura" className="btn btn-primary">
                Ver la lectura
              </a>
              <a href="#como" className="btn btn-secondary">
                Cómo está armado
              </a>
            </div>
          </div>

          <aside className="border border-line bg-elevated p-6" aria-label="En esta página">
            <p className="text-micro uppercase text-ink-muted">En esta página</p>
            <ol className="mt-6 divide-y divide-line">
              {LINES.map((line, index) => (
                <li key={line} className="flex gap-4 py-4 text-body text-ink">
                  <span className="text-micro w-6 pt-1 text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <section id="lectura" className="container-site py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20">
          <header>
            <p className="text-micro uppercase text-ink-muted">Lectura</p>
            <h2 className="text-h2 mt-3 text-ink">Tres capas</h2>
          </header>
          <ul className="divide-y divide-line border-y border-line">
            {LAYERS.map((item) => (
              <li
                key={item.title}
                className="grid gap-2 py-8 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10"
              >
                <h3 className="text-h4 text-ink">{item.title}</h3>
                <p className="text-body max-w-xl text-ink-secondary">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="como" className="container-site py-20 lg:py-28">
        <header className="max-w-2xl">
          <p className="text-micro uppercase text-ink-muted">Cómo</p>
          <h2 className="text-h2 mt-3 text-ink">De la pregunta al registro</h2>
        </header>
        <ol className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="bg-surface p-6">
              <p className="text-micro text-ink-muted">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="text-h4 mt-4 text-ink">{step.title}</h3>
              <p className="text-small mt-3 text-ink-secondary">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="band-ink">
        <div className="container-site flex flex-col items-start gap-8 py-20 lg:flex-row lg:items-end lg:justify-between lg:py-28">
          <div className="max-w-2xl">
            <h2 className="text-h1 text-balance">Cuando haya algo que anotar.</h2>
            <p className="text-body-lg band-ink-muted mt-4">
              El siguiente paso se queda en esta página, con el mismo navy y el mismo rosa.
            </p>
          </div>
          <a href="#inicio" className="btn btn-on-dark">
            Volver al inicio
          </a>
        </div>
      </section>
    </>
  );
}
