type Option = { value: string; label: string };

export function FilterComboboxList({
  listId,
  label,
  options,
  value,
  customLabel,
  onPick,
}: {
  listId: string;
  label: string;
  options: Option[];
  value: string;
  customLabel: string;
  onPick: (next: string) => void;
}) {
  return (
    <ul
      id={listId}
      role="listbox"
      aria-label={label}
      className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-sm border border-line bg-elevated p-1 shadow-[var(--card-shadow)]"
    >
      {options.map((option) => (
        <li key={option.value} role="presentation">
          <button
            type="button"
            role="option"
            aria-selected={option.value === value}
            className="w-full rounded-sm px-3 py-2 text-left text-small text-ink hover:bg-surface-subtle"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(option.value)}
          >
            {option.label}
          </button>
        </li>
      ))}
      {customLabel ? (
        <li role="presentation">
          <button
            type="button"
            className="w-full rounded-sm px-3 py-2 text-left text-small text-ink hover:bg-surface-subtle"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(customLabel)}
          >
            Usar “{customLabel}”
          </button>
        </li>
      ) : null}
      {options.length === 0 && !customLabel ? (
        <li className="px-3 py-2 text-small text-ink-muted">Sin coincidencias</li>
      ) : null}
    </ul>
  );
}
