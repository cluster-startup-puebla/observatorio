import { Flag } from "lucide-react";
import { ComingCard } from "@/components/app/coming-card";

export const instant = false;

export default function ChallengesPage() {
  return (
    <div className="grid min-h-[calc(100dvh-8rem)] place-items-center">
      <ComingCard
        icon={Flag}
        title="Retos"
        body="Aquí podrás lanzar retos públicos, anónimos o privados."
      />
    </div>
  );
}
