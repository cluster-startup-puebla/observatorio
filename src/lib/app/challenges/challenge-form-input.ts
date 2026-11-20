export type ChallengeFormInput = {
  id?: string;
  name: string;
  area: string;
  descriptionHtml: string;
  successMetric: string;
  urgency: "" | "baja" | "media" | "alta";
  visibility: "portal" | "red";
  showCompany: boolean;
};

export function contentFields(
  form: ChallengeFormInput,
  html: string,
  sectorId: string,
  legalName: string | null,
) {
  return {
    name: form.name.trim(),
    area: form.area,
    description_html: html,
    success_metric: form.successMetric.trim(),
    sector_id: sectorId,
    urgency: form.urgency || null,
    visibility: form.visibility,
    show_company: form.showCompany,
    company_name_snapshot: form.showCompany ? legalName : null,
  };
}
