"use client";

import { FileText, KeyRound, LayoutDashboard, MessageSquare, Users } from "lucide-react";

export const sidebarIcons: Record<string, React.ReactNode> = {
  Operación: <LayoutDashboard />,
  Comunicación: <MessageSquare />,
  Panel: <LayoutDashboard />,
  Seguridad: <KeyRound />,
  Directorio: <Users />,
  Contenido: <FileText />,
};
