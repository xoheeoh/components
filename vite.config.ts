/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

/** Vite lib 모드는 CSS url()을 data URI로 인라인하므로, 폰트는 별도 파일로 내보낸다. */
function emitPretendardFont(): Plugin {
  const fileName = "assets/PretendardVariable.woff2";
  const sourcePath = resolve(dirname, "src/styles/fonts/PretendardVariable.woff2");
  const fontsCssPath = resolve(dirname, "src/styles/fonts.css");
  return {
    name: "emit-pretendard-font",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      this.emitFile({
        type: "asset",
        fileName,
        source: readFileSync(sourcePath),
      });
      this.emitFile({
        type: "asset",
        fileName: "fonts.css",
        source: readFileSync(fontsCssPath, "utf8").replace(
          "./fonts/PretendardVariable.woff2",
          `./${fileName}`,
        ),
      });
      for (const item of Object.values(bundle)) {
        if (item.type !== "asset" || !item.fileName.endsWith(".css")) continue;
        const source =
          typeof item.source === "string" ? item.source : new TextDecoder().decode(item.source);
        if (!source.includes("data:font/woff2")) continue;
        item.source = source.replace(
          /url\(data:font\/woff2;base64,[A-Za-z0-9+/]+=*\)/g,
          `url(./${fileName})`,
        );
      }
    },
  };
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), emitPretendardFont()],
  build: {
    lib: {
      entry: resolve(dirname, "src/build-entry.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-dom/client",
        "date-fns",
        "react-day-picker",
        "@mdi/js",
      ],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.includes("fonts.css") || assetInfo.name === "fonts.css")
            return "fonts.css";
          if (assetInfo.name?.endsWith(".css")) return "styles.css";
          return "assets/[name][extname]";
        },
      },
    },
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    sourcemap: true,
    emptyOutDir: true,
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
});
