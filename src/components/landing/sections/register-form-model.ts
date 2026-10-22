export type FormState = {
  name: string;
  role: string;
  company: string;
  sector: string;
  size: string;
  email: string;
  whatsapp: string;
  source: string;
  privacy: boolean;
};

export type Errors = Partial<Record<keyof FormState, string>>;

export const empty: FormState = {
  name: "",
  role: "",
  company: "",
  sector: "",
  size: "",
  email: "",
  whatsapp: "",
  source: "",
  privacy: false,
};

export const successCopy =
  "Cupo de 15 a 30 empresas por sesión. El Clúster confirma el lugar por correo o WhatsApp cuando el registro quede conectado.";

export function validate(values: FormState): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = "Escribe tu nombre.";
  if (values.role.trim().length < 2) errors.role = "Escribe tu cargo.";
  if (values.company.trim().length < 2) errors.company = "Escribe el nombre de tu empresa.";
  if (values.sector.trim().length < 2) errors.sector = "Indica tu sector o actividad.";
  if (!values.size) errors.size = "Elige un rango de empleados.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Escribe un correo válido.";
  if (values.whatsapp.replace(/\D/g, "").length < 10) errors.whatsapp = "Escribe un WhatsApp de 10 dígitos.";
  if (!values.source) errors.source = "Cuéntanos cómo te enteraste.";
  if (!values.privacy) errors.privacy = "Necesitamos tu aceptación del aviso de privacidad.";
  return errors;
}
