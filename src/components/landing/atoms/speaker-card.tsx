import Image from "next/image";
import type { Speaker } from "@/content/speakers";

export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <article className="flex flex-col items-center text-center">
      <div className="rounded-md bg-navy p-1">
        <Image
          src={speaker.photo}
          alt={speaker.name}
          width={800}
          height={800}
          sizes="160px"
          className="size-32 rounded-full object-cover sm:size-36"
        />
      </div>
      <h3 className="text-h4 mt-5 text-balance text-ink">{speaker.name}</h3>
      <p className="text-small mt-2 text-balance text-ink-secondary">{speaker.position}</p>
      <p className="text-small mt-1 text-balance text-ink-secondary">{speaker.company}</p>
      <p className="text-small mt-2 font-semibold text-link">{speaker.slot}</p>
      <p className="text-small mt-3 text-balance text-ink-secondary">{speaker.topic}</p>
    </article>
  );
}
