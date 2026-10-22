"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { controlClass } from "@/components/landing/molecules/field";

export function PasswordInput({
  id,
  name,
  label,
  autoComplete,
  value,
  onChange,
  ariaInvalid,
  ariaDescribedBy,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  value?: string;
  onChange?: (value: string) => void;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}) {
  const [visible, setVisible] = useState(false);
  const controlled = value !== undefined;

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={controlled ? value : undefined}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className={`${controlClass} pr-12`}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-ink-secondary hover:text-ink"
        aria-label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  );
}
