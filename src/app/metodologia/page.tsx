import { Kicker } from "@/components/landing/atoms/kicker";
import { QuestionStep } from "@/components/methodology/question-step";
import { ConfidentialityNote } from "@/components/onboarding/confidentiality-note";
import { getDirectory, seedCompletedAnswers } from "@/lib/memory-directory";
import { SECTIONS } from "@/lib/methodology/instrument";
import { completedAnswerSeed } from "@/lib/methodology/seed";
import { answersFromStored, calculateIntegralResult } from "@/lib/methodology/score";

export const instant = false;

export default async function MetodologiaPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string; completas?: string; ver?: string }>;
}) {
  const params = await searchParams;
  const persona = params.persona?.trim() ?? "";
  if (persona && params.completas === "1" && process.env.DIRECTORY === "memory") {
    seedCompletedAnswers(persona, completedAnswerSeed());
  }
  const stored = persona ? await getDirectory().answersFor(persona) : {};
  const result = calculateIntegralResult(answersFromStored(stored));
  const question = SECTIONS[0].questions[0];

  return (
    <section className="container-site py-10 lg:py-14">
      <div className="grid max-w-3xl gap-6">
        <Kicker>Metodología</Kicker>
        <h1 className="text-h1 text-ink">Diagnóstico de la operación</h1>
        <p className="text-body-lg text-ink-secondary">
          Cada respuesta se guarda al elegirla. Puedes recargar y seguir en el mismo punto.
        </p>
        <ConfidentialityNote />
        <QuestionStep
          persona={persona}
          question={question}
          saved={stored[String(question.id)] ?? ""}
        />
        {Object.keys(stored).length >= 18 && params.ver === "1" ? (
          <div className="grid gap-3 border border-line bg-surface-subtle p-5">
            <p data-testid="nivel-integral" className="text-h2 text-ink">
              {result.category}
            </p>
            <a
              className="text-small font-semibold text-link"
              href={`/metodologia/diagnostico?persona=${encodeURIComponent(persona)}`}
            >
              Descargar diagnóstico
            </a>
          </div>
        ) : null}
        {Object.keys(stored).length >= 18 && params.ver !== "1" ? (
          <form action="/metodologia" className="grid">
            <input type="hidden" name="persona" value={persona} />
            <input type="hidden" name="ver" value="1" />
            <button type="submit" className="btn btn-primary w-fit">
              Ver diagnóstico
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
