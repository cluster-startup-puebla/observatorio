import { getDirectory } from "@/lib/memory-directory";
import { answersFromStored, calculateIntegralResult } from "@/lib/methodology/score";

export async function GET(request: Request) {
  const persona = new URL(request.url).searchParams.get("persona") ?? "";
  const stored = await getDirectory().answersFor(persona);
  const result = calculateIntegralResult(answersFromStored(stored));
  const lines = [
    result.category,
    String(result.totalScore),
    ...result.sections.map((section) => `${section.sectionName}: ${section.score} ${section.category}`),
    result.riesgo,
    result.reto,
  ];
  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="diagnostico.txt"',
    },
  });
}
