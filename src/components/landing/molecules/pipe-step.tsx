export function PipeStep({
  index,
  name,
  detail,
}: {
  index: number;
  name: string;
  detail: string;
}) {
  return (
    <li className="grid grid-cols-[3.25rem_1fr] gap-x-4 gap-y-2 border-b border-line py-7 lg:grid-cols-[4.5rem_12rem_1fr] lg:items-baseline lg:gap-x-10 lg:py-8">
      <p className="text-small font-semibold text-ink-muted">{String(index).padStart(2, "0")}</p>
      <h3 className="text-h3 text-ink">{name}</h3>
      <p className="text-body col-start-2 max-w-2xl text-ink-secondary lg:col-start-3">{detail}</p>
    </li>
  );
}
