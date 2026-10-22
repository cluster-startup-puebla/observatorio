type NavGroup = { name: string; links: readonly { href: string }[] };

export function hrefMatchesPath(path: string, href: string) {
  return path === href || (href !== "/admin" && (path === href || path.startsWith(`${href}/`)));
}

export function bestMatchingHref(path: string, hrefs: readonly string[]) {
  let best: string | null = null;
  for (const href of hrefs) {
    if (!hrefMatchesPath(path, href)) continue;
    if (best === null || href.length > best.length) best = href;
  }
  return best;
}

export function openGroupName(path: string, groups: readonly NavGroup[]) {
  const href = bestMatchingHref(
    path,
    groups.flatMap((group) => group.links.map((link) => link.href)),
  );
  if (!href) return null;
  return groups.find((group) => group.links.some((link) => link.href === href))?.name ?? null;
}
