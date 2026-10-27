import { Field, controlClass } from "@/components/landing/molecules/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cancelAttendanceAction } from "@/lib/onboarding/cancel-attendance";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

const notices: Record<string, string> = {
  motivo: "Escribe por qué cancelas.",
  todavia_no_ocupa: "Todavía no ocupas un lugar.",
  ya_cancelo: "Ya habías cancelado tu lugar.",
  cancelar: "No se pudo cancelar.",
};

export async function AttendanceSlot({ token, error }: { token: string; error?: string }) {
  const db = createSupabaseWithAccess(token);
  const state = await db.rpc("my_attendance_state");
  const status = typeof state.data === "string" ? state.data : "";
  if (status === "cancelo") {
    const row = await db.from("attendance_cancellations").select("reason").maybeSingle();
    return (
      <p className="text-body text-ink">
        Cancelaste tu lugar.{row.data?.reason ? ` ${row.data.reason}` : ""}
      </p>
    );
  }
  if (status !== "ocupa") return null;
  const notice = error ? notices[error] : "";
  return (
    <form action={cancelAttendanceAction} className="grid gap-3">
      {notice ? (
        <Alert variant="destructive">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <Field id="cancel-reason" label="Por qué cancelas tu asistencia">
        <textarea id="cancel-reason" name="reason" required maxLength={280} rows={3} className={controlClass} />
      </Field>
      <button className="btn btn-secondary w-fit" type="submit">
        Cancelar mi lugar
      </button>
    </form>
  );
}
