export type AdminModule = { title: string; lead: string; actions: string[] };

export const adminModules: Record<string, AdminModule> = {
  bandeja: {
    title: "Bandeja",
    lead: "Los tres correos: contraseña, pase e innovación abierta.",
    actions: ["Ver cada mensaje", "Reintentar un envío", "Filtrar por tipo"],
  },
  cuentas: {
    title: "Cuentas",
    lead: "Perfiles de los seis roles. El alta pública no elige staff.",
    actions: ["Crear moderador, capturista e invitador", "Cambiar rol", "Ver empresa, pase y respuestas"],
  },
  organismos: {
    title: "Organismos",
    lead: "Quien convoca: marca, miembros y enlaces.",
    actions: ["Editar nombre y logo", "Ver CRM", "Copiar el enlace del evento"],
  },
  empresas: {
    title: "Empresas",
    lead: "La empresa del empresario y su perfil.",
    actions: ["Ver tamaño y sector", "Ver respuestas", "Ver pase"],
  },
  crm: {
    title: "CRM",
    lead: "Contactos de todos los organismos. El estatus sale de los hechos.",
    actions: ["Contactar", "Rechazar", "Ver la conversión del enlace"],
  },
  invitaciones: {
    title: "Invitaciones",
    lead: "Carga de Excel y alta a mano.",
    actions: ["Subir plantilla", "Crear una fila", "Confirmar la cuenta"],
  },
  pases: {
    title: "Pases y llegadas",
    lead: "El QR del perfil y el escaneo de la mesa.",
    actions: ["Ver el pase", "Marcar que llegó", "Impedir un segundo escaneo"],
  },
  sectores: {
    title: "Sectores",
    lead: "El catálogo y el mensaje de la landing, solo si ya está escrito.",
    actions: ["Editar el sector", "Escribir titular y cuerpo", "Publicar la página"],
  },
  sesiones: {
    title: "Sesiones",
    lead: "La sesión del sector y sus temas.",
    actions: ["Crear sesión", "Editar temas", "Ver asistentes"],
  },
  metodologia: {
    title: "Metodología",
    lead: "Secciones, bandas, preguntas, opciones y condiciones.",
    actions: ["Editar preguntas", "Editar bandas Bronce Plata Oro", "Ver respuestas"],
  },
  medios: {
    title: "Medios",
    lead: "Logos, imágenes de contenido y pases. Los bytes están en Storage.",
    actions: ["Subir logo", "Subir imagen", "Reemplazar el pase"],
  },
};
