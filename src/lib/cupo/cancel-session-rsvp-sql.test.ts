import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261123054000_cancel_session_rsvp.sql", "utf8");

it("cancela solo el RSVP confirmado de esa sesión", () => {
  expect(sql).toContain("function public.cancel_session_rsvp(p_session_id uuid, p_reason text)");
  expect(sql).toContain("status = 'cancelled'");
  expect(sql).toContain("cancel_reason");
  expect(sql).toContain("raise exception 'ya_cancelo'");
  expect(sql).toContain("grant execute on function public.cancel_session_rsvp(uuid, text) to authenticated");
});

it("mesa y estado leen el RSVP", () => {
  expect(sql).toContain("function public.mesa_rsvp_guest(p_rsvp_id uuid)");
  expect(sql).toContain("r.status = 'confirmed'");
  expect(sql).toContain("function public.my_attendance_state()");
  expect(sql).toContain("session_rsvps");
});