import type { Meta, StoryObj } from "@storybook/react-vite";
import { Typography } from "./Typography";

const meta = {
  title: "Foundations/Typography",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tokens: Story = {
  render: () => <Typography />,
};
