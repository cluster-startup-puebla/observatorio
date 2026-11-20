import { Flag } from "lucide-react";
import { ComingCard } from "@/components/app/coming-card";
import { screenFrame } from "@/components/app/screen-frame";

export const instant = false;

export default function ChallengesPage() {
  return (
    <div className={screenFrame}>
      <ComingCard
        screen
        icon={Flag}
        title="Retos"
        body={
          <>
            Aquí podrás lanzar retos públicos,
            <br />
            anónimos o privados.
          </>
        }
      />
    </div>
  );
}
