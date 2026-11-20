import type { Metadata } from "next";
import { NoteList } from "@/components/blog/note-list";
import { pageMetadata } from "@/lib/metadata";
import { listNotes } from "@/lib/notes/markdown";

export const metadata: Metadata = pageMetadata({
  title: "Notas",
  description:
    "Notas del Observatorio Tecnológico de Puebla sobre las sesiones y lo que se publica del levantamiento.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const notes = listNotes()
    .filter((note) => note.category === "sala-de-prensa")
    .map(({ contentHtml, ...card }) => {
      void contentHtml;
      return card;
    });

  return (
    <div className="container-site py-16 lg:py-24">
      <header className="mb-12">
        <h1 className="text-h1 font-display text-ink">Notas</h1>
        <p className="text-body mt-4 text-ink-secondary">Lo que se publica de las sesiones del observatorio.</p>
      </header>
      <NoteList notes={notes} />
    </div>
  );
}
