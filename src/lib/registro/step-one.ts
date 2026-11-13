export type StepOne = {
  fullName: string;
  jobTitle: string;
  email: string;
  whatsapp: string;
};

export function stepOneIssue(input: StepOne): "nombre" | "puesto" | "correo" | "whatsapp" | null {
  if (input.fullName.trim().length < 2) return "nombre";
  if (input.jobTitle.trim().length < 2) return "puesto";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return "correo";
  const digits = input.whatsapp.replace(/\D/g, "");
  if (digits.length > 0 && (digits.length < 10 || digits.length > 15)) return "whatsapp";
  return null;
}
