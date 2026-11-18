import type { V2LevelStep } from "@/lib/methodology/v2/bands";

function splitActions(actions: string[]) {
  const own: string[] = [];
  const shared: string[] = [];
  const plain: string[] = [];
  for (const action of actions) {
    const house = action.match(/^Capa A\s*\([^)]*\):\s*(.*)$/i);
    const others = action.match(/^Capa B\s*\([^)]*\):\s*(.*)$/i);
    if (house?.[1]) own.push(house[1].trim());
    else if (others?.[1]) shared.push(others[1].trim());
    else plain.push(action);
  }
  return { own, shared, plain };
}

function List({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="list-disc space-y-2 pl-5 text-body text-ink">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Group({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="text-small font-medium text-ink">{title}</p>
      <List items={items} />
    </div>
  );
}

export function Steps({ step, signals }: { step: V2LevelStep | null; signals: string[] }) {
  const groups = splitActions(step?.actions ?? []);
  const empty = signals.length + groups.own.length + groups.shared.length + groups.plain.length === 0;
  if (empty) return null;
  return (
    <section className="space-y-3 rounded-2xl border border-line bg-elevated px-4 py-5">
      <p className="text-xs font-semibold tracking-wide text-brand uppercase">Después</p>
      <h2 className="text-base font-semibold text-ink">Siguientes pasos</h2>
      <List items={signals} />
      <List items={groups.plain} />
      <Group title="En tu empresa" items={groups.own} />
      <Group title="Con otras empresas de la región" items={groups.shared} />
    </section>
  );
}
