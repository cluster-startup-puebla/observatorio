export function CrmChips({
  label,
  current,
  options,
  hrefFor,
}: {
  label: string;
  current: string;
  options: { value: string; label: string }[];
  hrefFor: (value: string) => string;
}) {
  const items = [{ value: "", label: "Todos" }, ...options];
  return (
    <div className="grid gap-2">
      <p className="text-small font-semibold text-ink">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = current === item.value;
          return (
            <a
              key={item.label}
              href={hrefFor(item.value)}
              aria-current={active ? "true" : undefined}
              className={
                active
                  ? "rounded-full bg-brand px-3 py-1 text-small font-semibold text-on-brand"
                  : "rounded-full border border-line px-3 py-1 text-small font-semibold text-ink"
              }
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
