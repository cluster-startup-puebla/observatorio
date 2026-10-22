import type { Tablero } from "@/lib/admin/tablero/types";

const cards = [
  { key: "invitations", testId: "tablero-invitaciones", label: "Invitaciones", hint: "Excel y alta manual" },
  { key: "confirmations", testId: "tablero-confirmaciones", label: "Confirmaciones", hint: "Confirmaron, se registraron o llegaron" },
  { key: "rate", testId: "tablero-tasa", label: "Tasa", hint: "Confirmaciones entre invitaciones" },
  { key: "linkSignups", testId: "tablero-enlace", label: "Por enlace", hint: "Entraron con el enlace del organismo" },
] as const;

export function TableroKpis({ board }: { board: Tablero }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.key} className="rounded-2xl border border-line bg-elevated p-5" data-testid={card.testId}>
          <p className="text-small text-ink-secondary">{card.label}</p>
          <p className="mt-2 text-h2 text-ink tabular-nums">{figure(board, card.key)}</p>
          <p className="mt-2 text-small text-ink-muted">{card.hint}</p>
        </article>
      ))}
    </section>
  );
}

function figure(board: Tablero, key: (typeof cards)[number]["key"]) {
  if (key === "rate") return `${board.rate}%`;
  return board[key].toLocaleString("es-MX");
}
