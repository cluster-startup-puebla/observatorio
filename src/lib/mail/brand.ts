import { forumDate } from "@/content/forum-public";
import { clusterEmail, sessionFacts } from "@/content/landing";

export const mailBrand = {
  pink: "#e8186a",
  navy: "#16284f",
  muted: "#4b5563",
  line: "#e5e7eb",
  canvas: "#f7f7f8",
  white: "#ffffff",
  replyTo: clusterEmail,
  font: "Archivo, Raleway, Arial, sans-serif",
};

export function publicFacts(sessionLabel: string | null) {
  if (sessionLabel) return [{ label: "Sesión", value: sessionLabel }];
  const where = sessionFacts.find((fact) => fact.label === "Dónde")?.value ?? "";
  const hours = sessionFacts.find((fact) => fact.label === "Horario")?.value ?? "";
  return [
    { label: "Fecha", value: forumDate },
    { label: "Dónde", value: where },
    { label: "Horario", value: hours },
  ];
}
