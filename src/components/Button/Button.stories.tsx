import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { mdiPlus } from "@mdi/js";
import { Icon } from "../Icon";
import { Button } from "./Button";

const meta = {
  title: "Components/Action/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    onClick: fn(),
    label: "버튼",
    type: "button",
    variant: "solid",
    size: "md",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    label: { control: "text" },
    type: { control: "inline-radio", options: ["button", "submit", "reset"] },
    variant: {
      control: "select",
      options: ["solid", "outlined"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    color: { control: "select", options: ["primary", "neutral", "destructive"] },
    disabled: { control: "boolean" },
    style: { table: { disable: true } },
    className: { table: { disable: true } },
    loading: { table: { disable: true } },
    icon: { table: { disable: true } },
    iconPosition: { table: { disable: true } },
    iconOnly: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Button {...args} />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button variant="outlined" color="neutral" size="sm" label="Small" />
      <Button variant="outlined" color="neutral" size="md" label="Medium" />
      <Button variant="outlined" color="neutral" size="lg" label="Large" />
    </div>
  ),
};

export const Loading: Story = {
  render: (args) => <Button {...args} loading />,
};

export const WithIcon: Story = {
  render: (args) => (
    <Button
      {...args}
      size="md"
      label="추가하기"
      icon={<Icon path={mdiPlus} size={20} style={{ marginBottom: 1 }} />}
      iconPosition="right"
    />
  ),
};

export const IconOnly: Story = {
  render: (args) => <Button {...args} iconOnly icon={<Icon path={mdiPlus} size={20} />} />,
};
