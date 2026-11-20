"use client";

import { cn } from "cn";
import { Button } from "@/components/ui/button";

export function RichTextTool({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      title={title}
      className={cn("h-8 w-8 shrink-0 p-0", active && "bg-elevated")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
