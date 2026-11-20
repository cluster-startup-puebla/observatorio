import type { PublicSession } from "@/lib/sessions/load-public";
import { sessionPath } from "@/lib/sessions/public-path";
import { absoluteUrl } from "@/lib/site/origin";
import { pressNotes } from "@/lib/site/press-notes";
import { staticPublicPages } from "@/lib/site/public-paths";

type LlmsOptions = {
  origin?: string;
  sessions?: PublicSession[];
};

const pages = [
  ["/", "Puebla x Puebla", "Levantamiento de necesidades tecnológicas."],
  ["/sesiones", "Sesiones", "Calendario de encuentros públicos."],
  ["/blog", "Notas", "Lo que deja cada sesión."],
  ["/diagnostico-tmec-puebla", "Puebla ante el T-MEC", "Diagnóstico publicado."],
  ["/crear-cuenta", "Crear cuenta", "Entrada para empresas y equipos."],
  ["/aviso-de-privacidad", "Aviso de privacidad", "Tratamiento de datos personales."],
  ["/uso-de-datos", "Uso de datos", "Qué se pide en el registro y qué no se publica."],
] as const;

function link(origin: string | undefined, path: string, title: string, detail: string) {
  return `- [${title}](${absoluteUrl(path, origin)}): ${detail}`;
}

export function llmsText({ origin, sessions = [] }: LlmsOptions = {}) {
  const notes = pressNotes();
  const sessionLines = sessions.map((session) =>
    link(origin, sessionPath(session.publicSlug), session.title, `${session.sessionOn}. ${session.venue}`.trim()),
  );
  const noteLines = notes.map((note) => link(origin, `/blog/${note.slug}`, note.title, note.description));
  const pageLines = staticPublicPages.map((page) => {
    const copy = pages.find((item) => item[0] === page.path);
    return link(origin, page.path, copy?.[1] ?? page.path, copy?.[2] ?? "");
  });

  return [
    "# Observatorio Tecnológico de Puebla",
    "",
    "> Puebla x Puebla junta a la industria local con startups y equipos de desarrollo. Las empresas dicen qué tecnología les falta y la solución se valida con ellas.",
    "",
    "Lo operan el Clúster de Startups e Innovación y el Observatorio Tecnológico de Puebla. Las necesidades se publican agregadas y anónimas: el nombre de una empresa no aparece.",
    "",
    "## Páginas",
    "",
    ...pageLines,
    "",
    "## Sesiones",
    "",
    ...(sessionLines.length ? sessionLines : ["Todavía no hay sesiones en este índice."]),
    "",
    "## Notas",
    "",
    ...(noteLines.length ? noteLines : ["Todavía no hay notas publicadas."]),
    "",
    "## Fuera de este índice",
    "",
    "El panel, las cuentas, la metodología y los datos de cada empresa no son documentos públicos.",
    "",
  ].join("\n");
}
