const ACTION_ITEM_PATTERN = /^[\s\u200B\u00A0]*[*\-・●＊•]\s*(.+)/;

export function extractActionItems(memoContent: string) {
  const items: string[] = [];
  let inActionSection = false;

  for (const rawLine of memoContent.split("\n")) {
    const line = rawLine.trim();

    if (line.includes("行動リスト")) {
      inActionSection = true;
      continue;
    }

    if (!inActionSection) continue;
    if (line.includes("まとめポイント") || /^_{3,}$/.test(line) || /^⸻+$/.test(line)) break;

    const match = rawLine.match(ACTION_ITEM_PATTERN);
    if (match) items.push(match[1].trim());
  }

  return items;
}
