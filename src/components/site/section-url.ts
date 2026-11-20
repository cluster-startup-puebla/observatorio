const mark = 96;

export function sectionInView() {
  const nodes = [...document.querySelectorAll<HTMLElement>("[id].scroll-mt-24")];
  const scroller = document.scrollingElement;
  const room = scroller ? scroller.scrollHeight - scroller.clientHeight : 0;
  const atEnd = !!scroller && room > 8 && scroller.scrollTop >= room - 4;
  if (atEnd) return nodes.at(-1)?.id ?? "";

  let active = "";
  for (const node of nodes) {
    if (node.getBoundingClientRect().top <= mark) active = node.id;
  }
  return active;
}

export function sectionUrl(id: string) {
  const base = `${location.pathname}${location.search}`;
  if (!id || id === "inicio") return base;
  return `${base}#${id}`;
}

export function currentUrl() {
  return `${location.pathname}${location.search}${location.hash}`;
}
