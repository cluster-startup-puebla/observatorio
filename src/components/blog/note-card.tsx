import Link from "next/link";
import type { Note } from "@/lib/notes/markdown";

export type NoteCard = Omit<Note, "contentHtml">;

const labels: Record<string, string> = {
  "sala-de-prensa": "Sala de prensa",
  columna: "Columna",
};

export function noteDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function NoteCardView({ note }: { note: NoteCard }) {
  return (
    <Link href={`/blog/${note.slug}`} className="card group flex flex-col overflow-hidden transition hover:border-brand">
      {note.image ? (
        <img src={note.image.src} alt={note.image.alt} width={640} height={524} className="aspect-[640/524] w-full object-cover" />
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <time dateTime={note.date} className="text-micro whitespace-nowrap text-ink-muted">
            {noteDate(note.date)}
          </time>
          <span className="badge-brand whitespace-nowrap">{labels[note.category] ?? "Sala de prensa"}</span>
        </div>
        <h2 className="text-h4 font-display text-ink">{note.title}</h2>
        <p className="text-small text-ink-secondary">{note.excerpt}</p>
        <span className="text-small mt-auto text-link">Leer nota</span>
      </div>
    </Link>
  );
}
