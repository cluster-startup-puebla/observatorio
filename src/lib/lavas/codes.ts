export const LAVA_CODES = {
  perfilCompleto: "perfil_completo",
  evaluacionTerminada: "evaluacion_terminada",
  asistenciaLlego: "asistencia_llego",
  innovacionAceptada: "innovacion_aceptada",
  retoPublicado: "reto_publicado",
  ajusteManual: "ajuste_manual",
} as const;

export type LavaCode = (typeof LAVA_CODES)[keyof typeof LAVA_CODES];
