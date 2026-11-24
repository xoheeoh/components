// README에 넣는 미리보기 이미지(docs/preview.png)를 만든다.
// 빌드된 스토리북(storybook-static)을 잠깐 띄우고, Overview 스토리를 브라우저로 열어 화면을 찍는다.
// 실행: npm run preview:capture
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const storybookFolder = join(projectRoot, "storybook-static");
const imagePath = join(projectRoot, "docs", "preview.png");
const storyId = "overview--preview";

const contentTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

// storybook-static 폴더의 파일을 그대로 내려 주는 임시 서버다.
const server = createServer(async (request, response) => {
  const urlPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const filePath = join(storybookFolder, normalize(urlPath === "/" ? "/index.html" : urlPath));
  if (!filePath.startsWith(storybookFolder)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
    });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();

const browser = await chromium.launch();
try {
  // deviceScaleFactor 2 — 고해상도 화면에서도 흐리지 않게 가로세로 2배로 찍는다.
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
    deviceScaleFactor: 2,
  });
  await page.goto(`http://127.0.0.1:${port}/iframe.html?id=${storyId}&viewMode=story`);
  const story = page.locator("#storybook-root > *").first();
  await story.waitFor({ state: "visible" });
  // 글꼴이 다 내려받아진 뒤에 찍어야 글자 모양이 바뀌지 않는다.
  await page.evaluate(() => document.fonts.ready);
  // 움직이는 요소(로딩 표시 등)를 멈춰서 찍을 때마다 같은 이미지가 나오게 한다.
  await page.addStyleTag({
    content:
      "*, *::before, *::after { animation-play-state: paused !important; transition: none !important; }",
  });
  await story.screenshot({ path: imagePath });
  console.log(`미리보기 이미지를 저장했다: ${imagePath}`);
} finally {
  await browser.close();
  server.close();
}
