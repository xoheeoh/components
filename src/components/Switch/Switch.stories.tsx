import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./index";

const meta = {
  title: "Components/Form/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: {
    size: "sm",
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
    labelClassName: { table: { disable: true } },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "알림 받기" },
};

export const OnlySwitch: Story = {
  args: { label: undefined },
};

export const Disabled: Story = {
  args: { label: "알림 받기", disabled: true, checked: false },
};

export const DisabledOn: Story = {
  args: { label: "알림 받기", disabled: true, checked: true },
};

export const MultilineLabel: Story = {
  args: {
    label: (
      <>
        마케팅 알림
        <br />
        이벤트·혜택 정보를 받습니다.
      </>
    ),
  },
};
