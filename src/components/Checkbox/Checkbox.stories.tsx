import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./index";

const meta = {
  title: "Components/Form/Checkbox/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    size: "md",
    indeterminate: false,
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
    labelClassName: { table: { disable: true } },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "약관에 동의합니다" },
};

export const OnlyCheckbox: Story = {
  args: { label: undefined },
};

export const Disabled: Story = {
  args: { label: "약관에 동의합니다", disabled: true, checked: false },
};

export const Indeterminate: Story = {
  args: { label: "전체 동의", indeterminate: true, checked: false },
};

export const MultilineLabel: Story = {
  args: {
    label: (
      <>
        약관에 동의합니다.
        <br />
        미동의 시, 서비스 이용이 불가능합니다.
      </>
    ),
  },
};
