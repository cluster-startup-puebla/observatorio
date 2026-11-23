import { PendingSubmit } from "@/components/auth/pending-submit";

export function EmpresarioFormNav({
  step,
  onBack,
  onNext,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {step > 0 ? (
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          Atrás
        </button>
      ) : null}
      {step < 2 ? (
        <button type="button" className="btn btn-primary" onClick={onNext}>
          Continuar
        </button>
      ) : (
        <PendingSubmit idle="Terminar perfil" pendingLabel="Terminando…" />
      )}
    </div>
  );
}
