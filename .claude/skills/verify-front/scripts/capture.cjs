// front/ の画面をPlaywrightで開き、スクリーンショットとconsole出力を採取する。
// CommonJS形式にしているのは、NODE_PATH経由でplaywrightの場所を解決するため
// （ESM の import はNODE_PATHを見ないが、CommonJS の require は見る）。
// 引数: [1] 開くURL  [2] 出力ディレクトリ
const { chromium } = require('playwright');
const fs = require('node:fs');

const [, , url, outDir] = process.argv;

if (!url || !outDir) {
  console.error('Usage: node capture.cjs <url> <outDir>');
  process.exit(1);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const launchOptions = {};
  if (process.env.CHROMIUM_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.CHROMIUM_EXECUTABLE_PATH;
  }
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage();

  const consoleMessages = [];
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      consoleMessages.push({ type, text: msg.text() });
    }
  });
  page.on('pageerror', (err) => {
    consoleMessages.push({ type: 'pageerror', text: err.message });
  });

  let failed = null;
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: `${outDir}/screenshot.png`, fullPage: true });
  } catch (err) {
    failed = err.message;
  } finally {
    await browser.close();
  }

  fs.writeFileSync(`${outDir}/console.json`, JSON.stringify(consoleMessages, null, 2));

  if (failed) {
    console.error(`ページの読み込みに失敗しました: ${failed}`);
    process.exit(1);
  }

  console.log(`スクリーンショット: ${outDir}/screenshot.png`);
  console.log(`console.error/warning件数: ${consoleMessages.length}`);
  for (const m of consoleMessages) {
    console.log(`  [${m.type}] ${m.text}`);
  }
}

main();
