export function CuentaTabs({
  active,
  companyName,
  hasPass,
  answers,
  mail,
}: {
  active: string;
  companyName: string;
  hasPass: boolean;
  answers: { question_id: number; option_value: string }[];
  mail: { id: string; kind: string; subject: string }[];
}) {
  if (active === "empresa") return <p className="mt-4">{companyName || "Sin empresa."}</p>;
  if (active === "pase") return <p className="mt-4">{hasPass ? "Pase emitido." : "Sin pase."}</p>;
  if (active === "respuestas") {
    return (
      <ul className="mt-4">
        {answers.map((row) => (
          <li key={`${row.question_id}-${row.option_value}`}>
            {row.question_id}: {row.option_value}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="mt-4">
      {mail.map((row) => (
        <li key={row.id}>
          {row.kind}: {row.subject}
        </li>
      ))}
    </ul>
  );
}
