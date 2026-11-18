export function Curtain({ name, onEnter }: { name: string; onEnter: () => void }) {
  return (
    <section className="grid gap-4 bg-navy px-6 py-10 text-white">
      <h2 className="text-h2">Específico de tu sector</h2>
      <p className="text-body">{name}</p>
      <button
        type="button"
        className="w-fit bg-white px-4 py-2 text-body font-semibold text-navy"
        onClick={onEnter}
      >
        Entrar
      </button>
    </section>
  );
}
