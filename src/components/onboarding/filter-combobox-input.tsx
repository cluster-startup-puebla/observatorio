import { ChevronDown } from "lucide-react";
import { controlClass } from "@/components/landing/molecules/field";

export function FilterComboboxInput({
  id,
  listId,
  label,
  open,
  placeholder,
  text,
  onQuery,
  onOpen,
  onCommit,
}: {
  id: string;
  listId: string;
  label: string;
  open: boolean;
  placeholder: string;
  text: string;
  onQuery: (value: string) => void;
  onOpen: (open: boolean) => void;
  onCommit: () => void;
}) {
  return (
    <div className={`${controlClass} flex items-center gap-2`}>
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent outline-none"
        placeholder={placeholder}
        value={text}
        onFocus={() => onOpen(true)}
        onChange={(event) => onQuery(event.target.value)}
        onBlur={onCommit}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          onCommit();
        }}
      />
      <button type="button" aria-label={`Abrir ${label}`} onClick={() => onOpen(!open)}>
        <ChevronDown className="size-4 text-ink-muted" aria-hidden />
      </button>
    </div>
  );
}
