import { Kicker } from "@/components/landing/atoms/kicker";
import { forumKicker, forumName } from "@/content/forum-public";

export function EventTitle() {
  return (
    <div className="grid gap-2">
      <Kicker>{forumKicker}</Kicker>
      <p className="text-h3 text-balance text-ink">{forumName}</p>
    </div>
  );
}
