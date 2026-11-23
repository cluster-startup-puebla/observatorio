"use client";

import {
  FileText,
  Filter,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";

export const sidebarIcons: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard />,
  Embudo: <Filter />,
  Directorio: <Users />,
  Programa: <FileText />,
  Participación: <Sparkles />,
  Comunicación: <MessageSquare />,
  Operación: <LayoutDashboard />,
  Contenido: <FileText />,
  Panel: <LayoutDashboard />,
  Seguridad: <KeyRound />,
};
