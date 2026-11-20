import Link from "next/link";
import { AppCard } from "@/components/app/app-card";

export function EvaluationBanner({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <AppCard>
      <Link href="/metodologia" className="btn btn-primary w-full sm:w-fit">
        Realiza tu primera evaluación
      </Link>
    </AppCard>
  );
}
