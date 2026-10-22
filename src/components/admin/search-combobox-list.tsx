"use client";

type Item = { id: string; label: string };

export function SearchComboboxList({
  listId,
  label,
  value,
  noneLabel,
  filtered,
  onPick,
}: {
  listId: string;
  label: string;
  value: string;
  noneLabel: string;
  filtered: Item[];
  onPick: (next: string) => void;
}) {
  return (
    <ul id={listId} role="listbox" aria-label={label} className="max-h-48 overflow-auto">
      <li role="presentation">
        <button
          type="button"
          role="option"
          aria-selected={value === ""}
          onClick={() => onPick("")}
          className={`w-full rounded-md px-3 py-2 text-left text-small hover:bg-surface-subtle ${value === "" ? "bg-surface-subtle" : ""}`}
        >
          {noneLabel}
        </button>
      </li>
      {filtered.map((item) => (
        <li key={item.id} role="presentation">
          <button
            type="button"
            role="option"
            aria-selected={value === item.id}
            onClick={() => onPick(item.id)}
            className={`w-full rounded-md px-3 py-2 text-left text-small hover:bg-surface-subtle ${value === item.id ? "bg-surface-subtle" : ""}`}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
