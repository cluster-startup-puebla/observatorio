export function completedAnswerSeed(): Record<string, string> {
  const answers: Record<string, string> = {};
  for (let id = 1; id <= 17; id += 1) answers[String(id)] = "a";
  answers["18"] = JSON.stringify({
    falta_materiales: 1,
    fallas_mecanicas: 2,
    personal: 3,
    set_ups_lentos: 4,
  });
  return answers;
}
