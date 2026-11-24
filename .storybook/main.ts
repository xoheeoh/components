import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
  ],
  framework: "@storybook/react-vite",
  // 페이지가 처음 내려올 때의 탭 제목이다 ("@xoheeoh/components - Storybook").
  // 화면이 뜬 뒤의 제목은 manager.ts가 바꾼다.
  title: "@xoheeoh/components",
};
export default config;
