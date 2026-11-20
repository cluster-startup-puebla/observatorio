export function stepGroups(actions: string[]) {
  const own: string[] = [];
  const shared: string[] = [];
  const plain: string[] = [];
  for (const action of actions) {
    const house = action.match(/^Capa A\s*\([^)]*\):\s*(.*)$/i);
    const others = action.match(/^Capa B\s*\([^)]*\):\s*(.*)$/i);
    if (house?.[1]) own.push(house[1].trim());
    else if (others?.[1]) shared.push(others[1].trim());
    else plain.push(action);
  }
  return { own, shared, plain };
}
