import { Kicker } from "@/components/landing/atoms/kicker";
import { forumKicker } from "@/content/forum-public";

export function EventTitle() {
  return (
    <div className="grid gap-2">
      <Kicker>{forumKicker}</Kicker>
      <p className="text-balance text-xl leading-snug font-medium text-ink">
        Sesión Desayuno: Foro Puebla x Puebla
      </p>
    </div>
  );
}
