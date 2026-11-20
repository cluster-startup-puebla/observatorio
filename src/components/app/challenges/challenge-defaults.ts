import type { ChallengeFormState } from "./challenge-form-fields";

export function emptyChallengeForm(): ChallengeFormState {
  return {
    name: "",
    area: "ti",
    areaNote: "",
    descriptionHtml: "<p></p>",
    successMetric: "",
    urgency: "",
    visibility: "red",
    showCompany: false,
  };
}

export function formFromRow(row: {
  name: string;
  area: string;
  areaNote?: string | null;
  descriptionHtml: string;
  successMetric: string;
  urgency: string | null;
  visibility: string;
  showCompany: boolean;
}): ChallengeFormState {
  return {
    name: row.name,
    area: row.area,
    areaNote: row.areaNote ?? "",
    descriptionHtml: row.descriptionHtml,
    successMetric: row.successMetric,
    urgency: (row.urgency as ChallengeFormState["urgency"]) || "",
    visibility: row.visibility === "portal" ? "portal" : "red",
    showCompany: row.showCompany,
  };
}
