import { listNotes } from "@/lib/notes/markdown";

export function pressNotes() {
  return listNotes().filter((note) => note.category === "sala-de-prensa");
}
