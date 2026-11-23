import { redirectIfEventClosed } from "@/lib/auth/current-event-open";
import { redirectUnfinishedEmpresario } from "@/lib/auth/onboarding-gate";
import { readCompanyVerified } from "@/lib/auth/read-company-verified";
import { getDirectory } from "@/lib/memory-directory";
import { answersFromStored, calculateIntegralResult } from "@/lib/methodology/score";

export async function GET(request: Request) {
  await redirectUnfinishedEmpresario();
  if (!(await readCompanyVerified())) {
    return new Response("Tu empresa está pendiente de aceptación.\n", { status: 403 });
  }
  await redirectIfEventClosed();
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
