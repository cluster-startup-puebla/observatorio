import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/reset-form";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { pageMetadata } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Nueva contraseña",
  description: "Elige una contraseña nueva para tu cuenta.",
  path: "/restablecer",
});

export default async function ResetPage() {
  await redirectIfSession("/restablecer");
  return (
    <AuthShell
      title="Nueva contraseña"
      footer={
        <Link href="/login" className="text-link">
          Entrar
        </Link>
      }
    >
      <ResetForm />
    </AuthShell>
  );
}
