export function RegisterBand({ children }: { children: React.ReactNode }) {
  return (
    <section id="registro" className="scroll-mt-24 band-ink py-20 lg:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div>
          <h2 className="text-h2 text-balance">
            Tu sector va a ser escuchado. Asegura que tu empresa esté en la mesa.
          </h2>
          <p className="text-body-lg band-ink-muted mt-4">
            Cupo limitado de 15 a 30 empresas por sesión. Sin costo.
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}
