import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { noteDate } from "@/components/blog/note-card";
import { pageMetadata } from "@/lib/metadata";
import { noteBySlug } from "@/lib/notes/markdown";

type NotePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = noteBySlug(slug);
  if (!note) notFound();
  return pageMetadata({
    title: note.title,
    description: note.description,
    path: `/blog/${note.slug}`,
  });
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const note = noteBySlug(slug);
  if (!note) notFound();

  return (
    <div className="container-site py-16 lg:py-24">
      <article className="mx-auto max-w-3xl">
        <nav>
          <Link href="/blog" className="text-small text-link">
            Notas
          </Link>
        </nav>
        <header className="mt-8">
          <div className="flex items-center gap-3">
            <time dateTime={note.date} className="text-micro text-ink-muted">
              {noteDate(note.date)}
            </time>
            {note.category === "sala-de-prensa" ? <span className="badge-brand">Sala de prensa</span> : null}
            {note.category === "columna" ? <span className="badge-brand">Columna</span> : null}
          </div>
          <h1 className="text-h1 mt-2 font-display text-ink">{note.title}</h1>
          <p className="mt-4 text-body text-ink-secondary">{note.excerpt}</p>
          <p className="mt-6 text-small text-ink-muted">{note.author}</p>
        </header>
        {note.image ? (
          <img
            src={note.image.src}
            alt={note.image.alt}
            width={640}
            height={524}
            className="mt-10 h-auto w-full rounded-lg"
          />
        ) : null}
        <div className="article-body mt-12" dangerouslySetInnerHTML={{ __html: note.contentHtml }} />
      </article>
    </div>
  );
}
