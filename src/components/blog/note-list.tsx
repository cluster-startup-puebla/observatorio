import { NoteCardView, type NoteCard } from "./note-card";

export function NoteList({ notes }: { notes: NoteCard[] }) {
  if (notes.length === 0) {
    return <p className="text-body text-ink-secondary">Todavía no hay notas de sala de prensa.</p>;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => (
        <NoteCardView key={note.slug} note={note} />
      ))}
    </div>
  );
}
