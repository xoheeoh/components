import type { Meta, StoryObj } from "@storybook/react-vite";
import { mdiDownload, mdiPlus } from "@mdi/js";
import { fn } from "storybook/test";
import { Icon } from "../Icon";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: { onClick: fn(), children: "버튼" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "primary-soft",
        "secondary",
        "outline",
        "text",
        "destructive",
        "destructive-soft",
        "excel",
        "link",
      ],
    },
    size: { control: "select", options: ["sm", "md", "lg", "icon"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Outline: Story = {
  args: { variant: "outline" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "삭제" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button>
        <Icon path={mdiPlus} size={18} />
        추가
      </Button>
      <Button variant="secondary">
        <Icon path={mdiDownload} size={18} />
        다운로드
      </Button>
      <Button variant="excel">
        엑셀 다운로드
        <Icon path={mdiDownload} size={18} />
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  args: {
    size: "icon",
    variant: "outline",
    "aria-label": "추가",
    children: <Icon path={mdiPlus} size={20} />,
  },
};
