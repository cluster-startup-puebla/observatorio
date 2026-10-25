import { sessionOnLabel } from "@/lib/sessions/face";

type Choice = {
  id: string;
  venue: string;
  sessionOn: string | null;
  current: boolean;
};

export function SessionSelect({ choices, selectedId }: { choices: Choice[]; selectedId: string | null }) {
  const selected = selectedId ?? choices.find((choice) => choice.current)?.id ?? "";
  return (
    <form action="/admin" method="get" className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-small text-ink">
        Sesión
        <select
          key={selected}
          name="sesion"
          defaultValue={selected}
          data-testid="tablero-sesion"
          className="rounded-lg border border-line px-3 py-2"
        >
          {choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {optionLabel(choice)}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn">
        Ver
      </button>
    </form>
  );
}

function optionLabel(choice: Choice) {
  const when = choice.sessionOn ? ` · ${sessionOnLabel(choice.sessionOn)}` : "";
  const current = choice.current ? " (vigente)" : "";
  return `${choice.venue}${when}${current}`;
}
