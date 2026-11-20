export function ProgramSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line">
      <div className="container-site py-16 lg:py-24">
        <h2 className="text-h2 max-w-3xl text-balance text-ink">{title}</h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
