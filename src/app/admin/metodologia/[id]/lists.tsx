export function SectionLists({
  active,
  data,
}: {
  active: string;
  data: {
    bands: { level: string; min_score: number; max_score: number }[];
    questions: { id: number; position: number; prompt: string }[];
    options: { question_id: number; value: string; label: string }[];
    conditions: { question_id: number; expected_value: string }[];
    level: { category: string };
  };
}) {
  if (active === "bandas") {
    return (
      <ul>
        {data.bands.map((band) => (
          <li key={band.level}>
            {band.level}: {band.min_score}–{band.max_score}
          </li>
        ))}
      </ul>
    );
  }
  if (active === "preguntas") {
    return (
      <ul>
        {data.questions.map((question) => (
          <li key={question.id}>
            {question.position}. {question.prompt}
          </li>
        ))}
      </ul>
    );
  }
  if (active === "opciones") {
    return (
      <ul>
        {data.options.map((option) => (
          <li key={`${option.question_id}-${option.value}`}>{option.label}</li>
        ))}
      </ul>
    );
  }
  if (active === "condiciones") {
    return (
      <ul>
        {data.conditions.map((row) => (
          <li key={`${row.question_id}-${row.expected_value}`}>
            {row.question_id} si {row.expected_value}
          </li>
        ))}
      </ul>
    );
  }
  if (active === "nivel") return <p data-testid="nivel-calculado">{data.level.category}</p>;
  return null;
}
