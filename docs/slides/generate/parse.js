const fs = require("fs");

/**
 * Parses one slide markdown file into structured content.
 *
 * Format:
 *   # <Title>
 *
 *   Kicker: <short label shown above the title>   (optional)
 *
 *   <intro paragraph(s), plain text>               (optional)
 *
 *   ## <Section name>
 *   - bullet
 *   - bullet
 *
 *   ## <Section name>
 *   ### <item title>
 *   <item body paragraph>
 *
 *   ## <Section name>
 *   <plain text block>
 *
 * A section becomes { bullets: [...] } if every non-blank line starts
 * with "- ", { items: [{ title, body }] } if it contains "### " headings,
 * otherwise { text: "..." }.
 */
function parseSlideMarkdown(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  let i = 0;

  while (i < lines.length && lines[i].trim() === "") i++;

  let title = null;
  if (lines[i] && lines[i].startsWith("# ")) {
    title = lines[i].slice(2).trim();
    i++;
  }

  const preamble = [];
  while (i < lines.length && !lines[i].startsWith("## ")) {
    preamble.push(lines[i]);
    i++;
  }

  let kicker = null;
  const introLines = [];
  for (const line of preamble) {
    const t = line.trim();
    if (t === "") continue;
    const m = t.match(/^Kicker:\s*(.+)$/);
    if (m) {
      kicker = m[1].trim();
      continue;
    }
    introLines.push(t);
  }
  const intro = introLines.join("\n");

  const sectionOrder = [];
  const rawSections = {};
  let current = null;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      current = line.slice(3).trim();
      sectionOrder.push(current);
      rawSections[current] = [];
      i++;
      continue;
    }
    if (current) rawSections[current].push(line);
    i++;
  }

  const sections = {};
  for (const name of sectionOrder) {
    const rawLines = rawSections[name];
    const hasSubheadings = rawLines.some((l) => l.startsWith("### "));

    if (hasSubheadings) {
      const items = [];
      let cur = null;
      for (const l of rawLines) {
        if (l.startsWith("### ")) {
          if (cur) items.push(cur);
          cur = { title: l.slice(4).trim(), body: [] };
        } else if (cur) {
          const t = l.trim();
          if (t !== "") cur.body.push(t);
        }
      }
      if (cur) items.push(cur);
      for (const it of items) it.body = it.body.join("\n");
      sections[name] = { items };
      continue;
    }

    const trimmed = rawLines.map((l) => l.trim()).filter((l) => l !== "");
    const isBulletList = trimmed.length > 0 && trimmed.every((l) => l.startsWith("- "));
    if (isBulletList) {
      sections[name] = { bullets: trimmed.map((l) => l.slice(2).trim()) };
      continue;
    }

    sections[name] = { text: trimmed.join("\n") };
  }

  return { title, kicker, intro, sections };
}

module.exports = { parseSlideMarkdown };
