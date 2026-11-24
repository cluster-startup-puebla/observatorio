import { Brain, Building2, Lightbulb, Palette, Rocket, Scale } from "lucide-react";
import { debateTopics, debateTopicsTitle, type DebateTopicIcon } from "@/content/disruptors-debate";

const icons: Record<DebateTopicIcon, typeof Lightbulb> = {
  jobs: Lightbulb,
  creativity: Palette,
  skills: Brain,
  leadership: Building2,
  decisions: Scale,
  innovation: Rocket,
};

export function DebateTopics() {
  return (
    <div className="mt-14 border-t border-line pt-12">
      <div className="flex items-center justify-center gap-4">
        <span className="hidden h-px max-w-28 flex-1 bg-line sm:block" aria-hidden />
        <h3 className="text-center text-micro font-semibold tracking-[0.2em] text-ink-secondary uppercase">
          {debateTopicsTitle}
        </h3>
        <span className="hidden h-px max-w-28 flex-1 bg-line sm:block" aria-hidden />
      </div>
      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {debateTopics.map((topic) => {
          const Icon = icons[topic.icon];
          return (
            <li
              key={topic.question}
              className="flex flex-col items-center rounded-2xl border border-line bg-surface p-4 text-center"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                <Icon className="size-5" aria-hidden />
              </span>
              <p className="mt-3 text-small leading-snug text-ink">{topic.question}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
