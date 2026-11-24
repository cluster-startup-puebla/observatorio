export const portalKicker =
  "Estrategia de vinculación del ecosistema de innovación del Estado de Puebla";

export const portalInviteEyebrow = "Invitación abierta";

export const portalInviteHeadline =
  "¿Eres municipio, organismo empresarial o empresa?";

export const portalInviteBody =
  "Suma tu institución al ecosistema de innovación de Puebla. Te orientamos para crear tu cuenta y subir tu identidad.";

export const portalInviteCtas = [
  { label: "Soy un org empresarial", href: "/crear-cuenta?cuenta=organismo", primary: true },
  { label: "Soy empresa", href: "/crear-cuenta", primary: false },
] as const;

export const observatorioCta = {
  label: "Observatorio tecnológico",
  href: "/crear-cuenta?tipo=empresa",
} as const;

// Startups B2B: hidden until the product path is ready.
export const startupsCta = {
  label: "Startups B2B",
  href: "/sesiones",
} as const;
