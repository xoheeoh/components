import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DateField, type DateFieldRangeProps } from "./DateField";

function DateFieldRange(props: DateFieldRangeProps) {
  return <DateField {...props} />;
}

type DateFieldRangeStoryArgs = Omit<
  DateFieldRangeProps,
  "from" | "to" | "onFromChange" | "onToChange" | "shortcut" | "onShortcutChange"
> &
  Partial<
    Pick<
      DateFieldRangeProps,
      "from" | "to" | "onFromChange" | "onToChange" | "shortcut" | "onShortcutChange"
    >
  >;

function DateFieldRangeStory(args: DateFieldRangeStoryArgs) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [shortcut, setShortcut] = useState("");

  return (
    <DateFieldRange
      {...args}
      mode="range"
      from={from}
      to={to}
      shortcut={shortcut}
      onFromChange={setFrom}
      onToChange={setTo}
      onShortcutChange={setShortcut}
    />
  );
}

const meta = {
  title: "Components/Form/DateField/Range",
  component: DateFieldRange,
  tags: ["autodocs"],
  args: {
    mode: "range",
    label: "조회 기간",
    granularity: "date",
    size: "md",
    disabled: false,
    fullWidth: false,
    defaultToday: false,
    showShortcuts: true,
  },
  argTypes: {
    from: {
      control: false,
      type: { name: "string", required: true },
      description: "시작 값 (YYYY-MM-DD 또는 YYYY-MM)",
    },
    to: {
      control: false,
      type: { name: "string", required: true },
      description: "종료 값 (YYYY-MM-DD 또는 YYYY-MM)",
    },
    onFromChange: {
      control: false,
      type: { name: "function", required: true },
    },
    onToChange: {
      control: false,
      type: { name: "function", required: true },
    },
    shortcut: {
      control: false,
      type: { name: "string" },
    },
    onShortcutChange: {
      control: false,
      type: { name: "function" },
    },
    mode: { control: false },
    granularity: {
      control: "inline-radio",
      options: ["date", "month"],
      description: "일 단위(date) / 월 단위(month) 달력",
      table: { defaultValue: { summary: "date" } },
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      table: { defaultValue: { summary: "md" } },
    },
    label: { control: "text" },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    fullWidth: {
      control: "boolean",
      description: "true면 부모 너비에 맞춤",
      table: { defaultValue: { summary: "false" } },
    },
    defaultToday: {
      control: "boolean",
      description: "true면 값이 비어 있을 때 오늘(또는 이번 달)로 적용",
      table: { defaultValue: { summary: "false" } },
    },
    showShortcuts: {
      control: "boolean",
      description: "기간 숏컷 Select 표시 여부",
      table: { defaultValue: { summary: "true" } },
    },
  },
  render: (args) => <DateFieldRangeStory {...args} />,
  decorators: [
    (Story) => (
      <div style={{ width: 560, padding: 16, border: "1px dashed var(--semantic-neutral-border)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Omit<Meta<DateFieldRangeStoryArgs>, "component"> & {
  component: typeof DateFieldRange;
};

export default meta;
type Story = StoryObj<DateFieldRangeStoryArgs>;

export const Default: Story = {};

export const Month: Story = {
  args: { label: "조회 월", granularity: "month" },
};
