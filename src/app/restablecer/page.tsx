import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/reset-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Nueva contraseña",
  description: "Elige una contraseña nueva para tu cuenta.",
  path: "/restablecer",
});

export default function ResetPage() {
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
