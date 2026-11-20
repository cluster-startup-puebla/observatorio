const motion = "site-bar mx-auto flex items-center justify-between";

export function headerShell(onField: boolean, lifted: boolean) {
  if (!onField) return "container-site flex flex-nowrap items-center justify-between gap-6 py-3";
  if (!lifted) {
    return `${motion} w-full max-w-[80rem] flex-nowrap gap-6 border-x border-b border-transparent bg-transparent px-6 py-3 text-white lg:px-16`;
  }
  return `${motion} w-max max-w-[calc(100%-1.5rem)] gap-4 rounded-b-[1.75rem] border-x border-b border-line bg-surface px-4 py-2 text-ink shadow-[0_14px_28px_rgba(22,8,20,0.16)] sm:gap-5 sm:px-5`;
}
