import type { Meta, StoryObj } from "@storybook/react-vite";
import { mdiHome, mdiAccount } from "@mdi/js";
import { Icon } from "./Icon";

const meta = {
  title: "Components/Icon",
  component: Icon,
  tags: ["autodocs"],
  args: { path: mdiHome, size: 24 },
  argTypes: {
    path: { control: false },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Custom: Story = {
  args: { path: mdiAccount, color: "var(--color-primary-500)", size: 36 },
};
