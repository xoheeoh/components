/// <reference path="./env.d.ts" />
import type { Preview } from "@storybook/react-vite";
import "../src/styles/styles.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div
        style={{
          background: "var(--semantic-neutral-bg)",
          color: "var(--semantic-label-normal)",
        }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disabled: true },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
