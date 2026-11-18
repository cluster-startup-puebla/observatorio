import bank from "@/content/methodology/v2/index.json";

export function Pick({ ids, onChoose }: { ids: string[]; onChoose: (id: string) => void }) {
  return (
    <div className="grid gap-3">
      {ids.map((id) => {
        const label = bank.instruments.find((item) => item.id === id)?.label ?? id;
        return (
          <button
            key={id}
            type="button"
            className="border border-line bg-surface px-4 py-3 text-left text-body text-ink"
            onClick={() => onChoose(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
