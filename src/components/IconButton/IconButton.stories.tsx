import { mdiBellOutline } from "@mdi/js";
import { IconButton } from "./IconButton";
import { Icon } from "../Icon/Icon";
import { StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Action/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  args: {
    icon: <Icon path={mdiBellOutline} />,
    variant: "default",
    size: "md",
    color: "neutral",
    disabled: false,
    iconSize: "",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "outlined", "solid"] },
    color: { control: "select", options: ["primary", "neutral", "destructive"] },
    size: { control: "text", description: "sm / md 또는 48px 같은 길이" },
    iconSize: { control: "text", description: "아이콘 한 변. 비우면 size에 맞춰 자동" },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
    icon: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
