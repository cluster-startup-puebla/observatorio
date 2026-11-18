export function Curtain({ name, onEnter }: { name: string; onEnter: () => void }) {
  return (
    <section className="fixed inset-0 z-40 flex min-h-dvh flex-col justify-between overflow-y-auto bg-navy px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] text-white">
      <div>
        <p className="text-sm font-semibold tracking-wide">PueblaXPuebla</p>
        <p className="mt-2 text-sm font-medium">General listo</p>
      </div>
      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-semibold text-balance">Específico de tu sector</h1>
        <p className="text-lg leading-relaxed break-words">{name}</p>
      </div>
      <button type="button" className="h-12 w-full rounded-2xl bg-white text-base font-semibold text-navy" onClick={onEnter}>
        Entrar
      </button>
    </section>
  );
}
