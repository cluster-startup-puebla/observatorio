import Image from "next/image";

export function LogoBanner({ logo }: { logo: string | null }) {
  return (
    <div className="relative z-0 h-36 sm:h-52 md:h-72">
      <div className="absolute inset-0 overflow-hidden bg-surface-subtle">
        {logo ? (
          <div aria-hidden className="grid h-full grid-cols-4 place-items-center gap-3 p-3 sm:grid-cols-6 sm:gap-8 sm:p-8">
            {Array.from({ length: 12 }, (_, index) => (
              <Image
                key={index}
                src={logo}
                alt=""
                width={160}
                height={80}
                unoptimized
                className="max-h-16 w-full object-contain max-sm:[&:nth-child(n+9)]:hidden md:max-h-24"
              />
            ))}
          </div>
        ) : null}
      </div>
      <div aria-hidden className="absolute right-0 bottom-0 left-28 h-0.5 bg-ink/20 md:left-36" />
    </div>
  );
}
