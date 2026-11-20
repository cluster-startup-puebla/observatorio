"use client";

import { Columns2, Edit3, Eye } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

export type DescriptionMode = "editor" | "preview" | "split";

export function DescriptionModeBar({
  mode,
  setMode,
}: {
  mode: DescriptionMode;
  setMode: (m: DescriptionMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-line bg-surface-subtle p-1.5">
      <div className="flex md:hidden">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => setMode(mode === "editor" ? "preview" : "editor")}
          aria-label={mode === "editor" ? "Vista previa" : "Editor"}
        >
          {mode === "editor" ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
        </Button>
      </div>
      <div className="hidden gap-1 md:flex">
        <ModeBtn active={mode === "editor"} onClick={() => setMode("editor")} icon={Edit3} label="Editor" />
        <ModeBtn active={mode === "split"} onClick={() => setMode("split")} icon={Columns2} label="Dividido" />
        <ModeBtn active={mode === "preview"} onClick={() => setMode("preview")} icon={Eye} label="Preview" />
      </div>
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Edit3;
  label: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className={cn("h-8 gap-1.5 px-2 text-xs", active && "bg-elevated")}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
