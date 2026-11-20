import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderNoteHtml } from "./render-html";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");
const NOTE_FILE = /\.es\.md$/;
const SLUG = /^[A-Za-z0-9_-]+$/;

export type NoteImage = { src: string; alt: string };

export type Note = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image: NoteImage | null;
  contentHtml: string;
};

type Frontmatter = {
  title?: unknown;
  description?: unknown;
  excerpt?: unknown;
  date?: unknown;
  author?: unknown;
  category?: unknown;
  tags?: unknown;
  image?: unknown;
};

function asImage(value: unknown): NoteImage | null {
  if (!value || typeof value !== "object") return null;
  const image = value as { src?: unknown; alt?: unknown };
  if (typeof image.src !== "string" || !image.src.startsWith("/") || image.src.startsWith("//")) return null;
  return { src: image.src, alt: typeof image.alt === "string" ? image.alt : "" };
}

function asText(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === "string" ? value : "";
}

function asTags(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === "string");
}

function readNote(slug: string, dir: string): Note | null {
  if (!SLUG.test(slug)) return null;
  const full = path.join(dir, `${slug}.es.md`);
  if (!full.startsWith(dir) || !fs.existsSync(full)) return null;
  const { data, content } = matter(fs.readFileSync(full, "utf8"));
  const meta = data as Frontmatter;
  return {
    slug,
    title: asText(meta.title),
    description: asText(meta.description),
    excerpt: asText(meta.excerpt),
    date: asText(meta.date),
    author: asText(meta.author),
    category: asText(meta.category),
    tags: asTags(meta.tags),
    image: asImage(meta.image),
    contentHtml: renderNoteHtml(content),
  };
}

export function listNotes(dir = CONTENT_DIR): Note[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => NOTE_FILE.test(name))
    .map((name) => readNote(name.slice(0, -".es.md".length), dir))
    .filter((note): note is Note => note !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function noteBySlug(slug: string, dir = CONTENT_DIR): Note | null {
  return readNote(slug, dir);
}
