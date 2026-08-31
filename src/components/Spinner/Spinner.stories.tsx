import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./Spinner";

const surfaceStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: 24,
  background: "var(--semantic-neutral-bg)",
  color: "var(--semantic-label-normal)",
};

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  args: { size: "md", color: "primary" },
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    color: { control: "select", options: ["primary", "neutral", "destructive", "current"] },
    label: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div style={surfaceStyle}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Spinner color="primary" />
      <Spinner color="neutral" />
      <Spinner color="destructive" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};
