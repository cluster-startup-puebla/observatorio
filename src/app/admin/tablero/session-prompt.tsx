export function SessionPrompt() {
  return (
    <section
      data-testid="tablero-sin-sesion"
      className="rounded-2xl border border-dashed border-line bg-elevated/60 px-6 py-10 text-center"
    >
      <p className="text-h3 text-ink">Selecciona una sesión</p>
      <p className="mt-2 text-body text-ink-secondary">
        Elige una sesión arriba para ver la información de la convocatoria.
      </p>
    </section>
  );
}
