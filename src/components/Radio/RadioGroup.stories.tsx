import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup, type RadioGroupProps } from "./index";
import { expect } from "storybook/test";

const PLANS = [
  { value: "basic", label: "Basic" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

function RadioGroupStory(args: RadioGroupProps) {
  const [selected, setSelected] = useState<string | undefined>(
    () => args.value ?? args.defaultValue,
  );

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

/**
 * label prop 없이 바깥 글자를 aria-labelledby로 가리키는 경우다.
 * 이전에는 넘긴 aria-labelledby가 덮어써져 그룹 이름이 없었다.
 */
export const NamedByExternalLabel: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span id="radio-group-external-label">요금제</span>
      <RadioGroup aria-labelledby="radio-group-external-label" direction="horizontal" options={PLANS} defaultValue="basic" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radiogroup", { name: "요금제" })).toBeInTheDocument();
  },
};
