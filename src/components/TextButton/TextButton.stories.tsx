import { Meta, StoryObj } from "@storybook/react-vite";
import { TextButton } from "./TextButton";
import { fn } from "storybook/test";
import { Icon } from "../Icon";
import { mdiArrowLeft } from "@mdi/js";

const meta = {
  title: "Components/Action/TextButton",
  component: TextButton,
  tags: ["autodocs"],
  args: {
    label: "텍스트",
    type: "button",
    color: "primary",
    size: "md",
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    label: { control: "text" },
    type: { control: "inline-radio", options: ["button", "submit", "reset"] },
    color: { control: "select", options: ["primary", "neutral", "destructive"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    loading: { table: { disable: true } },
    icon: { table: { disable: true } },
    iconPosition: { table: { disable: true } },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof TextButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "텍스트",
  },
};

export const Loading: Story = {
  args: {
    label: "텍스트",
    color: "destructive",
    loading: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: "뒤로가기",
    color: "neutral",
    icon: <Icon path={mdiArrowLeft} style={{ marginBottom: 1 }} />,
  },
};
