import { expect, it } from "vitest";
import { V2_EXAMPLES } from "./examples";
import { V2_ORDINAL_SCORES } from "./ordinal";
import { hasScore, n1Question } from "./score-ficha-bank";

it("replay: every ED item of the four fichas finds a real option with that score", () => {
  for (const example of V2_EXAMPLES) {
    example.ed.forEach((score, i) => {
      const id = `ED-0${i + 1}`;
      expect(hasScore(n1Question(id), score), `${example.company} ${id}=${score} has a real option`).toBe(true);
    });
  }
});

it("replay: INO/COM option cards carry no printed score, so no ficha value is reachable by option.score", () => {
  const unscored: string[] = [];
  for (const id of ["INO-01", "INO-02", "INO-03", "INO-04", "COM-01", "COM-02", "COM-03"]) {
    const question = n1Question(id);
    expect(question.options?.length, `${id} has 4 option cards`).toBe(4);
    if (question.options!.every((option) => option.score === null)) unscored.push(id);
  }
  expect(unscored).toEqual(["INO-01", "INO-02", "INO-03", "INO-04", "COM-01", "COM-02", "COM-03"]);

  const missingByOptionScore = new Set<string>();
  const missingByOrdinal = new Set<string>();
  for (const example of V2_EXAMPLES) {
    const items: Array<[string, number]> = [
      ...example.ino.map((value, i): [string, number] => [`INO-0${i + 1}`, value]),
      ...example.com.map((value, i): [string, number] => [`COM-0${i + 1}`, value]),
    ];
    for (const [id, value] of items) {
      if (!hasScore(n1Question(id), value)) missingByOptionScore.add(`${example.key}:${id}=${value}`);
      if (!(V2_ORDINAL_SCORES as readonly number[]).includes(value)) {
        missingByOrdinal.add(`${example.key}:${id}=${value}`);
      }
    }
  }
  expect(missingByOptionScore.size, "all 28 INO/COM ficha items are unreachable by option.score").toBe(4 * 7);
  expect([...missingByOrdinal], "every INO/COM ficha value is on the 25/50/75/100 ordinal map").toEqual([]);
  for (const value of [25, 50, 75]) {
    for (const id of ["INO-01", "COM-01"]) expect(hasScore(n1Question(id), value)).toBe(false);
  }
});
