"use client";

import { FileText, KeyRound, LayoutDashboard, Users } from "lucide-react";

export const sidebarIcons: Record<string, React.ReactNode> = {
  Operación: <LayoutDashboard />,
  Panel: <LayoutDashboard />,
  Seguridad: <KeyRound />,
  Directorio: <Users />,
  Contenido: <FileText />,
};
