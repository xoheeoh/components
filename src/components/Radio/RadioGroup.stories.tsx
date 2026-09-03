import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup, type RadioGroupProps } from "./index";

const PLANS = [
  { value: "basic", label: "Basic" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

function RadioGroupStory(args: RadioGroupProps) {
  const [selected, setSelected] = useState<string | undefined>(() => args.value ?? args.defaultValue);

  return (
    <RadioGroup
      {...args}
      value={selected}
      onChange={(next, event) => {
        setSelected(next);
        args.onChange?.(next, event);
      }}
    />
  );
}

const meta = {
  title: "Components/Form/Radio/RadioGroup",
  component: RadioGroup,
  render: (args) => <RadioGroupStory {...args} />,
  tags: ["autodocs"],
  args: {
    label: "요금제",
    options: PLANS,
    direction: "vertical",
    size: "md",
    disabled: false,
    optionGap: 12,
  },
  argTypes: {
    direction: { control: "inline-radio", options: ["vertical", "horizontal"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
    optionGap: { control: { type: "number", min: 0, max: 40 } },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    onChange: { table: { disable: true } },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Horizontal: Story = {
  args: { direction: "horizontal" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "pro" },
};
