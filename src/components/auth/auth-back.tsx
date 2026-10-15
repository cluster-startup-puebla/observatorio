import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function AuthBack() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-small font-semibold text-ink hover:bg-surface-subtle"
    >
      <ArrowLeft className="size-5" aria-hidden />
      Volver
    </Link>
  );
}
