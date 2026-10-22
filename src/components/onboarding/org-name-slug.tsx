"use client";

import { useState } from "react";
import { Field, controlClass } from "@/components/landing/molecules/field";
import { orgSlug } from "@/lib/organismo/slug";

export function OrgNameSlug() {
  const [name, setName] = useState("");
  const slug = orgSlug(name, "");

  return (
    <>
      <Field id="nombre-organismo" label="Nombre del organismo">
        <input
          id="nombre-organismo"
          name="nombre"
          className={controlClass}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field id="slug-organismo" label="Enlace del panel">
        <p id="slug-organismo" className={`${controlClass} text-ink-secondary`} aria-live="polite">
          {slug ? `/${slug}` : "—"}
        </p>
      </Field>
    </>
  );
}
