const path = require("path");
const pptxgen = require("pptxgenjs");
const { iconPngBase64 } = require("./icons");
const { parseSlideMarkdown } = require("./parse");

const SLIDES_DIR = path.join(__dirname, "..");
function load(fileName) {
  return parseSlideMarkdown(path.join(SLIDES_DIR, fileName));
}

// ---- palette (Midnight Executive + electric cyan accent) ----
const NAVY = "1E2761";
const NAVY_SOFT = "2C3778";
const ICE = "CADCFC";
const WHITE = "FFFFFF";
const CYAN = "00B8D9";
const CHARCOAL = "2A2A33";
const MUTED = "5A6B8C";
const CARD = "EEF3FE";
const RED = "E53935";
const ORANGE = "FB8C00";
const GRAY = "757575";

const TITLE_FONT = "Cambria";
const BODY_FONT = "Calibri";

const W = 13.333,
  H = 7.5;

// Deadline-urgency color rule for the before/after demo slide: keeps the
// color mapping driven by the words content authors actually write
// ("本日"/"今日" => red, "明日" => orange), so the badge color never
// needs its own field in the markdown.
function urgencyColor(label) {
  if (label.includes("本日") || label.includes("今日")) return RED;
  if (label.includes("明日")) return ORANGE;
  return GRAY;
}

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";

  // ---------- helpers ----------
  async function iconCircle(slide, iconName, { x, y, d, dark, iconColor, circleColor }) {
    const cc = circleColor || (dark ? WHITE : NAVY);
    const ic = iconColor || (dark ? NAVY : WHITE);
    slide.addShape(pres.ShapeType.ellipse, {
      x,
      y,
      w: d,
      h: d,
      fill: { color: cc },
      line: { type: "none" },
      shadow: dark
        ? undefined
        : { type: "outer", color: "1E2761", opacity: 0.18, blur: 6, offset: 2, angle: 90 },
    });
    const pad = d * 0.28;
    const img = await iconPngBase64(iconName, ic, 256);
    slide.addImage({ data: img, x: x + pad / 2, y: y + pad / 2, w: d - pad, h: d - pad });
  }

  function kicker(slide, text, opts = {}) {
    slide.addText(text.toUpperCase(), {
      x: opts.x ?? 0.6,
      y: opts.y ?? 0.42,
      w: opts.w ?? 8,
      h: 0.35,
      fontFace: BODY_FONT,
      fontSize: 13,
      bold: true,
      color: opts.color ?? CYAN,
      charSpacing: 2,
      margin: 0,
      isTextBox: true,
    });
  }

  function title(slide, text, opts = {}) {
    slide.addText(text, {
      x: opts.x ?? 0.6,
      y: opts.y ?? 0.72,
      w: opts.w ?? 11.8,
      h: opts.h ?? 0.9,
      fontFace: TITLE_FONT,
      fontSize: opts.size ?? 32,
      bold: true,
      color: opts.color ?? NAVY,
      margin: 0,
      isTextBox: true,
    });
  }

  function pageNum(slide, n, dark) {
    slide.addText(String(n).padStart(2, "0"), {
      x: W - 1.0,
      y: H - 0.55,
      w: 0.6,
      h: 0.35,
      fontFace: BODY_FONT,
      fontSize: 10,
      color: dark ? "8892C2" : "A9B4CC",
      align: "right",
      margin: 0,
      isTextBox: true,
    });
  }

  function lightBg(slide) {
    slide.background = { color: WHITE };
  }
  function darkBg(slide) {
    slide.background = { color: NAVY };
  }

  // ================= Slide 1: Title =================
  {
    const md = load("01-title.md");
    const s = pres.addSlide();
    darkBg(s);
    s.addShape(pres.ShapeType.ellipse, {
      x: 9.8,
      y: -2.2,
      w: 6.5,
      h: 6.5,
      fill: { color: NAVY_SOFT },
      line: { type: "none" },
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: 11.6,
      y: 4.6,
      w: 3.6,
      h: 3.6,
      fill: { color: "263284" },
      line: { type: "none" },
    });
    await iconCircle(s, "FaWandMagicSparkles", { x: 0.9, y: 0.85, d: 1.0, dark: true, circleColor: CYAN, iconColor: NAVY });
    s.addText(md.kicker, {
      x: 2.1,
      y: 0.9,
      w: 8,
      h: 0.55,
      fontFace: BODY_FONT,
      fontSize: 15,
      bold: true,
      color: ICE,
      charSpacing: 1.5,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.title, {
      x: 0.9,
      y: 2.55,
      w: 11.2,
      h: 1.3,
      fontFace: TITLE_FONT,
      fontSize: 46,
      bold: true,
      color: WHITE,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.intro, {
      x: 0.9,
      y: 3.75,
      w: 11.2,
      h: 0.7,
      fontFace: TITLE_FONT,
      fontSize: 24,
      italic: true,
      color: ICE,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.sections["タグライン"].text, {
      x: 0.9,
      y: 5.55,
      w: 10.5,
      h: 0.5,
      fontFace: BODY_FONT,
      fontSize: 15,
      color: "AEB9E6",
      margin: 0,
      isTextBox: true,
    });
  }

  // ================= Slide 2: 背景・課題認識 =================
  {
    const md = load("02-why.md");
    const s = pres.addSlide();
    lightBg(s);
    kicker(s, md.kicker);
    title(s, md.title);
    const items = md.sections["理由"].items;
    const startY = 2.0,
      rowH = 1.55;
    for (let i = 0; i < items.length; i++) {
      const y = startY + i * rowH;
      s.addShape(pres.ShapeType.roundRect, {
        x: 0.6,
        y,
        w: 12.1,
        h: 1.3,
        rectRadius: 0.1,
        fill: { color: CARD },
        line: { type: "none" },
        shadow: { type: "outer", color: "1E2761", opacity: 0.1, blur: 8, offset: 2, angle: 90 },
      });
      await iconCircle(s, ["FaPeopleGroup", "FaLightbulb", "FaBriefcase"][i], {
        x: 0.95,
        y: y + 0.25,
        d: 0.8,
        dark: false,
      });
      s.addText(items[i].title, {
        x: 2.05,
        y: y + 0.16,
        w: 9.9,
        h: 0.45,
        fontFace: TITLE_FONT,
        fontSize: 18,
        bold: true,
        color: NAVY,
        margin: 0,
        isTextBox: true,
      });
      s.addText(items[i].body, {
        x: 2.05,
        y: y + 0.62,
        w: 9.9,
        h: 0.6,
        fontFace: BODY_FONT,
        fontSize: 14,
        color: CHARCOAL,
        margin: 0,
        isTextBox: true,
      });
    }
    pageNum(s, 2, false);
  }

  // ================= Slide 3: 目的 =================
  {
    const md = load("03-purpose.md");
    const s = pres.addSlide();
    lightBg(s);
    kicker(s, md.kicker);
    title(s, md.title);
    const iconNames = ["FaLightbulb", "FaFlaskVial", "FaBriefcase", "FaSeedling"];
    const goals = md.sections["目的"].items;
    const cols = 2,
      cardW = 5.85,
      cardH = 2.05,
      gx = 0.6,
      gy = 2.05,
      gapX = 0.3,
      gapY = 0.3;
    for (let i = 0; i < goals.length; i++) {
      const col = i % cols,
        row = Math.floor(i / cols);
      const x = gx + col * (cardW + gapX);
      const y = gy + row * (cardH + gapY);
      s.addShape(pres.ShapeType.roundRect, {
        x,
        y,
        w: cardW,
        h: cardH,
        rectRadius: 0.12,
        fill: { color: CARD },
        line: { type: "none" },
        shadow: { type: "outer", color: "1E2761", opacity: 0.1, blur: 8, offset: 2, angle: 90 },
      });
      await iconCircle(s, iconNames[i], { x: x + 0.3, y: y + 0.32, d: 0.85, dark: false });
      s.addText(goals[i].title, {
        x: x + 1.35,
        y: y + 0.28,
        w: cardW - 1.6,
        h: 0.55,
        fontFace: TITLE_FONT,
        fontSize: 17,
        bold: true,
        color: NAVY,
        margin: 0,
        isTextBox: true,
      });
      s.addText(goals[i].body, {
        x: x + 1.35,
        y: y + 0.85,
        w: cardW - 1.6,
        h: 0.9,
        fontFace: BODY_FONT,
        fontSize: 13.5,
        color: CHARCOAL,
        margin: 0,
        isTextBox: true,
      });
    }
    pageNum(s, 3, false);
  }

  // ================= Slide 4: アジェンダ =================
  {
    const md = load("04-agenda.md");
    const s = pres.addSlide();
    lightBg(s);
    kicker(s, md.kicker);
    title(s, md.title);
    const iconNames = ["FaComments", "FaCodeBranch", "FaBriefcase"];
    const steps = md.sections["ステップ"].items;
    const n = steps.length;
    if (n < 2) {
      throw new Error(`04-agenda.md の「ステップ」は2件以上必要です（現在${n}件）`);
    }
    const lineY = 3.55;
    const marginX = 1.1;
    const usableW = W - marginX * 2;
    s.addShape(pres.ShapeType.line, {
      x: marginX,
      y: lineY,
      w: usableW,
      h: 0,
      line: { color: ICE, width: 2.5 },
    });
    const d = 0.95;
    for (let i = 0; i < n; i++) {
      const cx = marginX + (usableW / (n - 1)) * i;
      await iconCircle(s, iconNames[i], { x: cx - d / 2, y: lineY - d / 2, d, dark: false });
      s.addText(String(i + 1), {
        x: cx - 0.35,
        y: lineY - d / 2 - 0.5,
        w: 0.7,
        h: 0.4,
        align: "center",
        fontFace: BODY_FONT,
        fontSize: 13,
        bold: true,
        color: CYAN,
        margin: 0,
        isTextBox: true,
      });
      s.addText(steps[i].title, {
        x: cx - 1.1,
        y: lineY + d / 2 + 0.18,
        w: 2.2,
        h: 0.4,
        align: "center",
        fontFace: TITLE_FONT,
        fontSize: 16,
        bold: true,
        color: NAVY,
        margin: 0,
        isTextBox: true,
      });
      s.addText(steps[i].body, {
        x: cx - 1.15,
        y: lineY + d / 2 + 0.6,
        w: 2.3,
        h: 0.7,
        align: "center",
        fontFace: BODY_FONT,
        fontSize: 12.5,
        color: MUTED,
        margin: 0,
        isTextBox: true,
      });
    }
    pageNum(s, 4, false);
  }

  // ================= Slide 5: Section divider - 前半 =================
  {
    const md = load("05-part1-divider.md");
    const s = pres.addSlide();
    darkBg(s);
    s.addShape(pres.ShapeType.ellipse, {
      x: -2.5,
      y: 3.2,
      w: 6,
      h: 6,
      fill: { color: NAVY_SOFT },
      line: { type: "none" },
    });
    await iconCircle(s, "FaCode", { x: 0.9, y: 2.6, d: 1.3, dark: true, circleColor: CYAN, iconColor: NAVY });
    s.addText(md.kicker, {
      x: 2.5,
      y: 2.75,
      w: 8,
      h: 0.4,
      fontFace: BODY_FONT,
      fontSize: 14,
      bold: true,
      color: CYAN,
      charSpacing: 2,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.title, {
      x: 2.5,
      y: 3.1,
      w: 9.5,
      h: 1.1,
      fontFace: TITLE_FONT,
      fontSize: 38,
      bold: true,
      color: WHITE,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.intro, {
      x: 2.5,
      y: 4.15,
      w: 9.5,
      h: 0.6,
      fontFace: BODY_FONT,
      fontSize: 15,
      italic: true,
      color: ICE,
      margin: 0,
      isTextBox: true,
    });
  }

  // ================= Slide 6: AI駆動開発とは =================
  {
    const md = load("06-what-is-ai-driven-dev.md");
    const s = pres.addSlide();
    lightBg(s);
    kicker(s, md.kicker);
    title(s, md.title);
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: 2.05,
      w: 7.1,
      h: 4.55,
      rectRadius: 0.12,
      fill: { color: CARD },
      line: { type: "none" },
    });
    const bullets = md.sections["本文"].bullets;
    s.addText(
      bullets.map((b, i) => ({
        text: b,
        options: { bullet: { code: "25AA" }, breakLine: i !== bullets.length - 1, paraSpaceAfter: 16 },
      })),
      {
        x: 0.95,
        y: 2.35,
        w: 6.45,
        h: 4.0,
        fontFace: BODY_FONT,
        fontSize: 15,
        color: CHARCOAL,
        valign: "top",
        margin: 0,
        isTextBox: true,
      }
    );
    // right illustration column
    s.addShape(pres.ShapeType.roundRect, {
      x: 8.0,
      y: 2.05,
      w: 4.75,
      h: 4.55,
      rectRadius: 0.12,
      fill: { color: NAVY },
      line: { type: "none" },
    });
    await iconCircle(s, "FaRobot", { x: 9.7, y: 2.55, d: 1.4, dark: true, circleColor: CYAN, iconColor: NAVY });
    const panel = md.sections["サイドパネル"].items[0];
    s.addText(panel.title, {
      x: 8.3,
      y: 4.15,
      w: 4.15,
      h: 0.5,
      align: "center",
      fontFace: TITLE_FONT,
      fontSize: 20,
      bold: true,
      color: WHITE,
      margin: 0,
      isTextBox: true,
    });
    s.addText(panel.body, {
      x: 8.3,
      y: 4.7,
      w: 4.15,
      h: 1.6,
      align: "center",
      fontFace: BODY_FONT,
      fontSize: 13,
      color: ICE,
      margin: 0,
      isTextBox: true,
    });
    pageNum(s, 6, false);
  }

  // ================= Slide 7: デモ ワークフロー =================
  {
    const md = load("07-demo-workflow.md");
    const s = pres.addSlide();
    lightBg(s);
    kicker(s, md.kicker);
    title(s, md.title);
    s.addText(md.intro, {
      x: 0.6,
      y: 1.62,
      w: 12.1,
      h: 0.4,
      fontFace: BODY_FONT,
      fontSize: 13.5,
      italic: true,
      color: MUTED,
      margin: 0,
      isTextBox: true,
    });
    const iconNames = ["FaSlack", "FaGithub", "FaCode", "FaMagnifyingGlass", "FaWrench"];
    const steps = md.sections["ステップ"].items;
    const n = steps.length;
    if (n < 2) {
      throw new Error(`07-demo-workflow.md の「ステップ」は2件以上必要です（現在${n}件）`);
    }
    const marginX = 0.75;
    const usableW = W - marginX * 2;
    const lineY = 3.05;
    const d = 0.85;
    s.addShape(pres.ShapeType.line, {
      x: marginX,
      y: lineY,
      w: usableW,
      h: 0,
      line: { color: ICE, width: 2.5 },
    });
    for (let i = 0; i < n; i++) {
      const cx = marginX + (usableW / (n - 1)) * i;
      await iconCircle(s, iconNames[i], { x: cx - d / 2, y: lineY - d / 2, d, dark: false });
      s.addText(steps[i].title, {
        x: cx - 1.0,
        y: lineY + d / 2 + 0.15,
        w: 2.0,
        h: 0.4,
        align: "center",
        fontFace: TITLE_FONT,
        fontSize: 13.5,
        bold: true,
        color: NAVY,
        margin: 0,
        isTextBox: true,
      });
      s.addText(steps[i].body, {
        x: cx - 1.05,
        y: lineY + d / 2 + 0.55,
        w: 2.1,
        h: 1.15,
        align: "center",
        fontFace: BODY_FONT,
        fontSize: 10.5,
        color: MUTED,
        margin: 0,
        isTextBox: true,
      });
    }
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: 6.2,
      w: 12.1,
      h: 0.85,
      rectRadius: 0.1,
      fill: { color: NAVY },
      line: { type: "none" },
    });
    s.addText(md.sections["まとめ帯"].text, {
      x: 0.9,
      y: 6.2,
      w: 11.5,
      h: 0.85,
      valign: "middle",
      fontFace: BODY_FONT,
      fontSize: 14,
      color: WHITE,
      margin: 0,
      isTextBox: true,
    });
    s.addNotes(md.sections["Notes"].text);
    pageNum(s, 7, false);
  }

  // ================= Slide 8: Before/After =================
  {
    const md = load("08-demo-before-after.md");
    const s = pres.addSlide();
    lightBg(s);
    kicker(s, md.kicker);
    title(s, md.title);
    s.addText(md.intro, {
      x: 0.6,
      y: 1.65,
      w: 12.1,
      h: 0.5,
      fontFace: BODY_FONT,
      fontSize: 14,
      italic: true,
      color: MUTED,
      margin: 0,
      isTextBox: true,
    });
    const colW = 5.85,
      colH = 4.3,
      gy = 2.35;
    // Before
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: gy,
      w: colW,
      h: colH,
      rectRadius: 0.12,
      fill: { color: "F2F2F2" },
      line: { type: "none" },
    });
    s.addText("Before", {
      x: 0.9,
      y: gy + 0.2,
      w: colW - 0.6,
      h: 0.4,
      fontFace: TITLE_FONT,
      fontSize: 16,
      bold: true,
      color: GRAY,
      margin: 0,
      isTextBox: true,
    });
    const beforeRows = md.sections["Before"].bullets;
    beforeRows.forEach((t, i) => {
      const y = gy + 0.85 + i * 0.85;
      s.addShape(pres.ShapeType.roundRect, {
        x: 0.9,
        y,
        w: colW - 0.6,
        h: 0.65,
        rectRadius: 0.06,
        fill: { color: WHITE },
        line: { color: "DADADA", width: 1 },
      });
      s.addText(t, {
        x: 1.1,
        y,
        w: colW - 1.0,
        h: 0.65,
        valign: "middle",
        fontFace: BODY_FONT,
        fontSize: 13,
        color: CHARCOAL,
        margin: 0,
        isTextBox: true,
      });
    });
    // After
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.6 + colW + 0.3,
      y: gy,
      w: colW,
      h: colH,
      rectRadius: 0.12,
      fill: { color: CARD },
      line: { type: "none" },
    });
    s.addText("After", {
      x: 0.9 + colW + 0.3,
      y: gy + 0.2,
      w: colW - 0.6,
      h: 0.4,
      fontFace: TITLE_FONT,
      fontSize: 16,
      bold: true,
      color: NAVY,
      margin: 0,
      isTextBox: true,
    });
    const afterRows = md.sections["After"].bullets.map((t) => [t, urgencyColor(t)]);
    afterRows.forEach(([t, color], i) => {
      const y = gy + 0.85 + i * 0.85;
      const ax = 0.9 + colW + 0.3;
      s.addShape(pres.ShapeType.roundRect, {
        x: ax,
        y,
        w: colW - 0.6,
        h: 0.65,
        rectRadius: 0.06,
        fill: { color: WHITE },
        line: { type: "none" },
        shadow: { type: "outer", color: "1E2761", opacity: 0.08, blur: 5, offset: 1, angle: 90 },
      });
      s.addShape(pres.ShapeType.roundRect, {
        x: ax + (colW - 0.6) - 1.15,
        y: y + 0.14,
        w: 0.95,
        h: 0.37,
        rectRadius: 0.06,
        fill: { color },
        line: { type: "none" },
      });
      s.addText(t.split("　　")[1] || "", {
        x: ax + (colW - 0.6) - 1.15,
        y: y + 0.14,
        w: 0.95,
        h: 0.37,
        align: "center",
        valign: "middle",
        fontFace: BODY_FONT,
        fontSize: 11,
        bold: true,
        color: WHITE,
        margin: 0,
        isTextBox: true,
      });
      s.addText(t.split("　　")[0], {
        x: ax + 0.2,
        y,
        w: colW - 2.0,
        h: 0.65,
        valign: "middle",
        fontFace: BODY_FONT,
        fontSize: 13,
        color: CHARCOAL,
        margin: 0,
        isTextBox: true,
      });
    });
    pageNum(s, 8, false);
  }

  // ================= Slide 9: セルフレビュー =================
  {
    const md = load("09-self-review.md");
    const s = pres.addSlide();
    lightBg(s);
    kicker(s, md.kicker);
    title(s, md.title);
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: 1.85,
      w: 12.1,
      h: 1.15,
      rectRadius: 0.12,
      fill: { color: NAVY },
      line: { type: "none" },
    });
    await iconCircle(s, "FaMagnifyingGlass", { x: 0.9, y: 2.1, d: 0.65, dark: true, circleColor: CYAN, iconColor: NAVY });
    s.addText(md.sections["問いかけ"].text, {
      x: 1.75,
      y: 1.85,
      w: 10.7,
      h: 1.15,
      valign: "middle",
      italic: true,
      fontFace: TITLE_FONT,
      fontSize: 19,
      color: WHITE,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.sections["見出し"].text, {
      x: 0.6,
      y: 3.35,
      w: 12,
      h: 0.4,
      fontFace: BODY_FONT,
      fontSize: 14,
      bold: true,
      color: MUTED,
      margin: 0,
      isTextBox: true,
    });
    const findings = md.sections["指摘"].bullets;
    const fy = 3.85;
    for (let i = 0; i < findings.length; i++) {
      const y = fy + i * 0.85;
      s.addShape(pres.ShapeType.roundRect, {
        x: 0.6,
        y,
        w: 12.1,
        h: 0.7,
        rectRadius: 0.08,
        fill: { color: CARD },
        line: { type: "none" },
      });
      await iconCircle(s, "FaCircleCheck", { x: 0.8, y: y + 0.12, d: 0.46, dark: false, circleColor: CYAN, iconColor: NAVY });
      s.addText(findings[i], {
        x: 1.5,
        y,
        w: 11.0,
        h: 0.7,
        valign: "middle",
        fontFace: BODY_FONT,
        fontSize: 13,
        color: CHARCOAL,
        margin: 0,
        isTextBox: true,
      });
    }
    s.addText(md.sections["フッター"].text, {
      x: 0.6,
      y: 6.55,
      w: 12.1,
      h: 0.5,
      fontFace: BODY_FONT,
      fontSize: 13,
      italic: true,
      color: MUTED,
      margin: 0,
      isTextBox: true,
    });
    pageNum(s, 9, false);
  }

  // ================= Slide 10: クロージング（数字） =================
  {
    const md = load("10-closing-numbers.md");
    const s = pres.addSlide();
    darkBg(s);
    s.addShape(pres.ShapeType.ellipse, {
      x: -3,
      y: -3,
      w: 7,
      h: 7,
      fill: { color: NAVY_SOFT },
      line: { type: "none" },
    });
    kicker(s, md.kicker, { color: CYAN });
    s.addText(md.title, {
      x: 0.6,
      y: 1.1,
      w: 12,
      h: 0.7,
      fontFace: TITLE_FONT,
      fontSize: 26,
      bold: true,
      color: WHITE,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.sections["Before数値"].text, {
      x: 0.9,
      y: 2.5,
      w: 5.2,
      h: 1.4,
      fontFace: TITLE_FONT,
      fontSize: 44,
      bold: true,
      color: "8892C2",
      margin: 0,
      isTextBox: true,
    });
    await iconCircle(s, "FaArrowRight", { x: 6.25, y: 2.85, d: 0.9, dark: true, circleColor: CYAN, iconColor: NAVY });
    s.addText(md.sections["After数値"].text, {
      x: 7.5,
      y: 2.5,
      w: 5.2,
      h: 1.4,
      fontFace: TITLE_FONT,
      fontSize: 60,
      bold: true,
      color: CYAN,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.sections["補足1"].text, {
      x: 0.9,
      y: 4.35,
      w: 11,
      h: 0.5,
      fontFace: BODY_FONT,
      fontSize: 16,
      color: ICE,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.sections["補足2"].text, {
      x: 0.9,
      y: 5.15,
      w: 11,
      h: 0.5,
      fontFace: BODY_FONT,
      fontSize: 16,
      italic: true,
      color: WHITE,
      margin: 0,
      isTextBox: true,
    });
  }

  // ================= Slide 11: 種明かし =================
  {
    const md = load("11-behind-the-scenes.md");
    const s = pres.addSlide();
    lightBg(s);
    kicker(s, md.kicker);
    title(s, md.title);
    s.addText(md.intro, {
      x: 0.6,
      y: 1.65,
      w: 12.1,
      h: 0.5,
      fontFace: BODY_FONT,
      fontSize: 14,
      italic: true,
      color: MUTED,
      margin: 0,
      isTextBox: true,
    });
    const iconNames = ["FaListCheck", "FaShieldHalved", "FaCodeBranch", "FaUserGear"];
    const items = md.sections["要素"].items;
    const cols = 2,
      cardW = 5.85,
      cardH = 2.05,
      gx = 0.6,
      gy = 2.35,
      gapX = 0.3,
      gapY = 0.3;
    for (let i = 0; i < items.length; i++) {
      const col = i % cols,
        row = Math.floor(i / cols);
      const x = gx + col * (cardW + gapX);
      const y = gy + row * (cardH + gapY);
      s.addShape(pres.ShapeType.roundRect, {
        x,
        y,
        w: cardW,
        h: cardH,
        rectRadius: 0.12,
        fill: { color: CARD },
        line: { type: "none" },
        shadow: { type: "outer", color: "1E2761", opacity: 0.1, blur: 8, offset: 2, angle: 90 },
      });
      await iconCircle(s, iconNames[i], { x: x + 0.3, y: y + 0.32, d: 0.85, dark: false });
      s.addText(items[i].title, {
        x: x + 1.35,
        y: y + 0.24,
        w: cardW - 1.6,
        h: 0.45,
        fontFace: TITLE_FONT,
        fontSize: 17,
        bold: true,
        color: NAVY,
        margin: 0,
        isTextBox: true,
      });
      s.addText(items[i].body, {
        x: x + 1.35,
        y: y + 0.78,
        w: cardW - 1.6,
        h: 1.05,
        fontFace: BODY_FONT,
        fontSize: 13,
        color: CHARCOAL,
        margin: 0,
        isTextBox: true,
      });
    }
    pageNum(s, 11, false);
  }

  // ================= Slide 12: 並列実行とコスト =================
  {
    const md = load("12-parallel-scale.md");
    const s = pres.addSlide();
    darkBg(s);
    s.addShape(pres.ShapeType.ellipse, {
      x: -3,
      y: -3,
      w: 7,
      h: 7,
      fill: { color: NAVY_SOFT },
      line: { type: "none" },
    });
    kicker(s, md.kicker, { color: CYAN });
    s.addText(md.title, {
      x: 0.6,
      y: 1.1,
      w: 12,
      h: 0.7,
      fontFace: TITLE_FONT,
      fontSize: 26,
      bold: true,
      color: WHITE,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.intro, {
      x: 0.6,
      y: 1.75,
      w: 12,
      h: 0.4,
      fontFace: BODY_FONT,
      fontSize: 14,
      italic: true,
      color: ICE,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.sections["Before数値"].text, {
      x: 0.9,
      y: 2.7,
      w: 5.2,
      h: 1.4,
      fontFace: TITLE_FONT,
      fontSize: 34,
      bold: true,
      color: "8892C2",
      margin: 0,
      isTextBox: true,
    });
    await iconCircle(s, "FaArrowRight", { x: 6.25, y: 3.05, d: 0.9, dark: true, circleColor: CYAN, iconColor: NAVY });
    s.addText(md.sections["After数値"].text, {
      x: 7.5,
      y: 2.7,
      w: 5.2,
      h: 1.4,
      fontFace: TITLE_FONT,
      fontSize: 34,
      bold: true,
      color: CYAN,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.sections["補足1"].text, {
      x: 0.9,
      y: 4.55,
      w: 11,
      h: 0.7,
      fontFace: BODY_FONT,
      fontSize: 16,
      color: ICE,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.sections["補足2"].text, {
      x: 0.9,
      y: 5.55,
      w: 11,
      h: 0.9,
      fontFace: BODY_FONT,
      fontSize: 14,
      italic: true,
      color: "AEB9E6",
      margin: 0,
      isTextBox: true,
    });
  }

  // ================= Slide 13: Section divider - 後半 =================
  {
    const md = load("13-part2-divider.md");
    const s = pres.addSlide();
    darkBg(s);
    s.addShape(pres.ShapeType.ellipse, {
      x: -2.5,
      y: 3.2,
      w: 6,
      h: 6,
      fill: { color: NAVY_SOFT },
      line: { type: "none" },
    });
    await iconCircle(s, "FaBriefcase", { x: 0.9, y: 2.6, d: 1.3, dark: true, circleColor: CYAN, iconColor: NAVY });
    s.addText(md.kicker, {
      x: 2.5,
      y: 2.75,
      w: 8,
      h: 0.4,
      fontFace: BODY_FONT,
      fontSize: 14,
      bold: true,
      color: CYAN,
      charSpacing: 2,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.title, {
      x: 2.5,
      y: 3.1,
      w: 9.5,
      h: 1.1,
      fontFace: TITLE_FONT,
      fontSize: 38,
      bold: true,
      color: WHITE,
      margin: 0,
      isTextBox: true,
    });
    s.addText(md.intro, {
      x: 2.5,
      y: 4.15,
      w: 9.5,
      h: 0.6,
      fontFace: BODY_FONT,
      fontSize: 15,
      italic: true,
      color: ICE,
      margin: 0,
      isTextBox: true,
    });
  }

  // ================= Slide 14: AIは開発だけじゃない =================
  {
    const md = load("14-beyond-development.md");
    const s = pres.addSlide();
    lightBg(s);
    kicker(s, md.kicker);
    title(s, md.title);
    const iconNames = ["FaEnvelope", "FaCalendarDays", "FaListCheck", "FaFileLines", "FaBullhorn"];
    const items = md.sections["項目"].bullets;
    const n = items.length;
    const cardW = 2.28,
      cardH = 3.2,
      gap = 0.18;
    const totalW = n * cardW + (n - 1) * gap;
    const startX = (W - totalW) / 2;
    const y = 2.35;
    for (let i = 0; i < n; i++) {
      const x = startX + i * (cardW + gap);
      s.addShape(pres.ShapeType.roundRect, {
        x,
        y,
        w: cardW,
        h: cardH,
        rectRadius: 0.12,
        fill: { color: i % 2 === 0 ? CARD : "F5F8FF" },
        line: { type: "none" },
        shadow: { type: "outer", color: "1E2761", opacity: 0.08, blur: 7, offset: 2, angle: 90 },
      });
      await iconCircle(s, iconNames[i], { x: x + cardW / 2 - 0.5, y: y + 0.5, d: 1.0, dark: false });
      s.addText(items[i], {
        x: x + 0.12,
        y: y + 1.75,
        w: cardW - 0.24,
        h: 1.1,
        align: "center",
        fontFace: TITLE_FONT,
        fontSize: 14.5,
        bold: true,
        color: NAVY,
        margin: 0,
        isTextBox: true,
      });
    }
    pageNum(s, 14, false);
  }

  // ================= Slide 15: 職種別 =================
  {
    const md = load("15-roles.md");
    const s = pres.addSlide();
    lightBg(s);
    kicker(s, md.kicker);
    title(s, md.title);
    const iconNames = ["FaUserTie", "FaBuilding", "FaChalkboardUser", "FaLaptopCode"];
    const roles = md.sections["ロール"].items;
    const cols = 2,
      cardW = 5.85,
      cardH = 2.05,
      gx = 0.6,
      gy = 2.05,
      gapX = 0.3,
      gapY = 0.3;
    for (let i = 0; i < roles.length; i++) {
      const col = i % cols,
        row = Math.floor(i / cols);
      const x = gx + col * (cardW + gapX);
      const yy = gy + row * (cardH + gapY);
      s.addShape(pres.ShapeType.roundRect, {
        x,
        y: yy,
        w: cardW,
        h: cardH,
        rectRadius: 0.12,
        fill: { color: CARD },
        line: { type: "none" },
        shadow: { type: "outer", color: "1E2761", opacity: 0.1, blur: 8, offset: 2, angle: 90 },
      });
      await iconCircle(s, iconNames[i], { x: x + 0.3, y: yy + 0.32, d: 0.85, dark: false });
      s.addText(roles[i].title, {
        x: x + 1.35,
        y: yy + 0.24,
        w: cardW - 1.6,
        h: 0.45,
        fontFace: TITLE_FONT,
        fontSize: 17,
        bold: true,
        color: NAVY,
        margin: 0,
        isTextBox: true,
      });
      s.addText(roles[i].body, {
        x: x + 1.35,
        y: yy + 0.78,
        w: cardW - 1.6,
        h: 1.05,
        fontFace: BODY_FONT,
        fontSize: 13,
        color: CHARCOAL,
        margin: 0,
        isTextBox: true,
      });
    }
    pageNum(s, 15, false);
  }

  // ================= Slide 16: まとめ =================
  {
    const md = load("16-wrap-up.md");
    const s = pres.addSlide();
    darkBg(s);
    s.addShape(pres.ShapeType.ellipse, {
      x: 9.8,
      y: -2.2,
      w: 6.5,
      h: 6.5,
      fill: { color: NAVY_SOFT },
      line: { type: "none" },
    });
    kicker(s, md.kicker, { color: CYAN });
    s.addText(md.title, {
      x: 0.6,
      y: 1.05,
      w: 11.5,
      h: 0.9,
      fontFace: TITLE_FONT,
      fontSize: 32,
      bold: true,
      color: WHITE,
      margin: 0,
      isTextBox: true,
    });
    const iconNames = ["FaRobot", "FaBriefcase", "FaWandMagicSparkles"];
    const takeaways = md.sections["メッセージ"].items;
    const y0 = 2.2,
      rowH = 1.4;
    for (let i = 0; i < takeaways.length; i++) {
      const y = y0 + i * rowH;
      await iconCircle(s, iconNames[i], { x: 0.75, y: y + 0.05, d: 0.85, dark: true, circleColor: CYAN, iconColor: NAVY });
      s.addText(takeaways[i].title, {
        x: 1.85,
        y: y - 0.05,
        w: 10.3,
        h: 0.5,
        fontFace: TITLE_FONT,
        fontSize: 18,
        bold: true,
        color: WHITE,
        margin: 0,
        isTextBox: true,
      });
      s.addText(takeaways[i].body, {
        x: 1.85,
        y: y + 0.42,
        w: 10.3,
        h: 0.55,
        fontFace: BODY_FONT,
        fontSize: 13.5,
        color: ICE,
        margin: 0,
        isTextBox: true,
      });
    }
    s.addText(md.sections["タグライン"].text, {
      x: 0.6,
      y: 6.5,
      w: 11.5,
      h: 0.5,
      fontFace: TITLE_FONT,
      italic: true,
      fontSize: 17,
      color: CYAN,
      margin: 0,
      isTextBox: true,
    });
  }

  await pres.writeFile({ fileName: "ai-driven-dev-seminar.pptx" });
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
