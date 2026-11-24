import Image from "next/image";
import { debateModerator } from "@/content/disruptors-debate";

export function DebateModerator() {
  return (
    <div className="order-first flex flex-col items-center justify-center py-4 lg:order-none lg:px-4 lg:py-0">
      <span className="hidden h-10 w-px bg-line lg:block" aria-hidden />
      <div className="flex flex-col items-center py-4 text-center">
        <div className="relative size-18 overflow-hidden rounded-full border-2 border-brand/40 bg-navy sm:size-20">
          <Image
            src={debateModerator.photo}
            alt={`${debateModerator.firstName} ${debateModerator.lastName}`}
            fill
            sizes="80px"
            className="object-cover object-top"
          />
        </div>
        <p className="mt-4 text-micro font-semibold tracking-[0.2em] text-brand uppercase">
          {debateModerator.kicker}
        </p>
        <h3 className="mt-1 font-display text-h3 leading-tight text-ink">
          {debateModerator.firstName}
          <br />
          {debateModerator.lastName}
        </h3>
        <p className="mt-1.5 max-w-[14rem] text-small text-ink-secondary">
          {debateModerator.role}
        </p>
      </div>
      <span className="hidden h-10 w-px bg-line lg:block" aria-hidden />
    </div>
  );
}
