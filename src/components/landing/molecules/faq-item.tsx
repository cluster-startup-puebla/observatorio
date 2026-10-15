export function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-b border-line py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-h4 text-ink [&::-webkit-details-marker]:hidden">
        {question}
        <span aria-hidden className="text-ink-muted group-open:hidden">
          +
        </span>
        <span aria-hidden className="hidden text-ink-muted group-open:inline">
          –
        </span>
      </summary>
      <p className="text-body mt-3 max-w-3xl text-ink-secondary">{answer}</p>
    </details>
  );
}
