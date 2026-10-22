export function LinkCards({
  opens,
  conversions,
  rate,
}: {
  opens: number;
  conversions: number;
  rate: number;
}) {
  const cards = [
    { testId: "org-aperturas", label: "Aperturas", value: String(opens) },
    { testId: "org-conversiones", label: "Conversiones", value: String(conversions) },
    { testId: "org-tasa", label: "Tasa", value: `${rate}%` },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.testId}
          data-testid={card.testId}
          className="rounded-2xl border border-line bg-elevated p-5"
        >
          <p className="text-small text-ink-secondary">{card.label}</p>
          <p className="mt-1 text-h2 text-ink tabular-nums">{card.value}</p>
        </article>
      ))}
    </div>
  );
}
