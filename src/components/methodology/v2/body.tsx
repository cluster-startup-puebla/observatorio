"use client";

import { Checks } from "@/components/methodology/v2/checks";
import { ChoiceList, type WidgetTone } from "@/components/methodology/v2/choice-list";
import { ChoiceWithText } from "@/components/methodology/v2/choice-with-text";
import { LikertFive } from "@/components/methodology/v2/likert-five";
import { RankBoard } from "@/components/methodology/v2/rank-board";
import type { V2Answer, V2Option, V2Question } from "@/lib/methodology/v2/types";

export function QuestionBody({
  question,
  answer,
  onChange,
}: {
  question: V2Question;
  answer: V2Answer | undefined;
  onChange: (answer: V2Answer) => void;
}) {
  const tone: WidgetTone = question.level === "n1" ? "brand" : "navy";
  const options = question.options ?? [];

  if (question.prefilled || question.type === "single_select") {
    return (
      <ChoiceList
        options={prefilledOptions(question, options, answer)}
        value={answer?.kind === "single" ? answer.optionValue : null}
        tone={tone}
        onChange={(optionValue) => onChange({ kind: "single", optionValue })}
      />
    );
  }

  if (question.type === "single_select_text") {
    return (
      <ChoiceWithText
        options={options}
        value={answer?.kind === "text" ? answer.optionValue : null}
        text={answer?.kind === "text" ? answer.text : ""}
        maxLength={question.text?.maxLength}
        textOptionValue={question.text?.optionValue ?? null}
        tone={tone}
        onChange={(next) => onChange({ kind: "text", optionValue: next.optionValue, text: next.text })}
      />
    );
  }

  if (question.type === "likert_5") {
    return (
      <LikertFive
        options={options}
        value={answer?.kind === "single" ? answer.optionValue : null}
        tone={tone}
        onChange={(optionValue) => onChange({ kind: "single", optionValue })}
      />
    );
  }

  if (question.type === "rank") {
    return (
      <RankBoard
        factors={question.factors ?? []}
        ranks={answer?.kind === "rank" ? answer.ranks : {}}
        tone={tone}
        onChange={(ranks) => onChange({ kind: "rank", ranks })}
      />
    );
  }

  return (
    <Checks
      factors={question.factors ?? []}
      selected={answer?.kind === "checks" ? answer.selected : []}
      tone={tone}
      onChange={(selected) => onChange({ kind: "checks", selected })}
    />
  );
}

function prefilledOptions(question: V2Question, options: V2Option[], answer: V2Answer | undefined) {
  if (!question.prefilled || answer?.kind !== "single") return options;
  const marked = options.filter((option) => option.value === answer.optionValue);
  return marked.length > 0 ? marked : options;
}
