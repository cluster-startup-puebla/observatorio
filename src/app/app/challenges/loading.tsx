import { Skeleton } from "@/components/ui/skeleton";
import { screenFrame } from "@/components/app/screen-frame";

export default function ChallengesLoading() {
  return (
    <div className={screenFrame} aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando</span>
      <Skeleton className="h-40 w-full max-md:bg-transparent md:h-full md:rounded-[2rem]" />
    </div>
  );
}