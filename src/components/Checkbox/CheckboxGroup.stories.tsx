import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox, CheckboxGroup, type CheckboxGroupProps } from "./index";

const INTERESTS = [
  { value: "item1", label: "E-mail" },
  { value: "item2", label: "SMS" },
  { value: "item3", label: "푸시 알림" },
];

const TERMS = [
  { value: "terms1", label: "(필수) 서비스 이용약관" },
  { value: "terms2", label: "(필수) 개인정보 수집 및 이용약관" },
  { value: "terms3", label: "(선택) 광고성 정보 수신 동의" },
];

function CheckboxGroupStory(args: CheckboxGroupProps) {
  const [selected, setSelected] = useState<string[]>(() => args.value ?? args.defaultValue ?? []);

  return (
    <CheckboxGroup
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
  title: "Components/Form/Checkbox/CheckboxGroup",
  component: CheckboxGroup,
  render: (args) => <CheckboxGroupStory {...args} />,
  tags: ["autodocs"],
  args: {
    label: "광고성 정보 수신",
    options: INTERESTS,
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
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Horizontal: Story = {
  args: { direction: "horizontal" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithSelectAll: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    const values = TERMS.map((o) => o.value);
    const allChecked = values.every((v) => selected.includes(v));
    const someChecked = values.some((v) => selected.includes(v));

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span id="checkbox-group-terms-label" className="text-subtitle3">
          약관동의
        </span>
        <Checkbox
          label="전체"
          checked={allChecked}
          indeterminate={someChecked && !allChecked}
          onChange={(e) => setSelected(e.target.checked ? values : [])}
        />
        <CheckboxGroup
          aria-labelledby="checkbox-group-terms-label"
          direction="vertical"
          options={TERMS}
          value={selected}
          onChange={setSelected}
          optionGap={8}
        />
      </div>
    );
  },
};
