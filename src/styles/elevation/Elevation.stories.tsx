import type { Meta, StoryObj } from "@storybook/react-vite";
import { Elevation } from "./Elevation";

const meta = {
  title: "Foundations/Elevation",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tokens: Story = {
  render: () => <Elevation />,
};
