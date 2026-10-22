"use client";

type Org = { id: string; name: string | null };

export function OrgComboboxList({
  listId,
  value,
  noneLabel,
  filtered,
  onPick,
}: {
  listId: string;
  value: string;
  noneLabel: string;
  filtered: Org[];
  onPick: (next: string) => void;
}) {
  return (
    <ul id={listId} role="listbox" aria-label="Organismo" className="max-h-48 overflow-auto">
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
      {filtered.map((org) => (
        <li key={org.id} role="presentation">
          <button
            type="button"
            role="option"
            aria-selected={value === org.id}
            onClick={() => onPick(org.id)}
            className={`w-full rounded-md px-3 py-2 text-left text-small hover:bg-surface-subtle ${value === org.id ? "bg-surface-subtle" : ""}`}
          >
            {org.name ?? org.id}
          </button>
        </li>
      ))}
    </ul>
  );
}
