import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio } from "./index";

const meta = {
  title: "Components/Form/Radio/Radio",
  component: Radio,
  tags: ["autodocs"],
  args: {
    size: "md",
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
    labelClassName: { table: { disable: true } },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "선택지" },
};

export const OnlyRadio: Story = {
  args: { label: undefined },
};

export const Disabled: Story = {
  args: { label: "선택지", disabled: true, checked: false },
};

export const MultilineLabel: Story = {
  args: {
    label: (
      <>
        기본 요금제
        <br />
        월 9,900원
      </>
    ),
  },
};
