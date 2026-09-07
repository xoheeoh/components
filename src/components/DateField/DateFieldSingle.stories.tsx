import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DateField, type DateFieldSingleProps } from "./DateField";

function DateFieldSingle(props: DateFieldSingleProps) {
  return <DateField {...props} />;
}

type DateFieldSingleStoryArgs = Omit<DateFieldSingleProps, "value" | "onValueChange"> &
  Partial<Pick<DateFieldSingleProps, "value" | "onValueChange">>;

function DateFieldSingleStory(args: DateFieldSingleStoryArgs) {
  const [value, setValue] = useState("");
  return <DateFieldSingle {...args} value={value} onValueChange={setValue} />;
}

const meta = {
  title: "Components/Form/DateField/Single",
  component: DateFieldSingle,
  tags: ["autodocs"],
  args: {
    label: "날짜",
    granularity: "date",
    size: "md",
    disabled: false,
    fullWidth: false,
    defaultToday: false,
  },
  argTypes: {
    value: {
      control: false,
      type: { name: "string", required: true },
      description: "선택 값 (YYYY-MM-DD 또는 YYYY-MM)",
    },
    onValueChange: {
      control: false,
      type: { name: "function", required: true },
    },
    granularity: {
      control: "select",
      options: ["date", "month"],
      description: "일 단위(date) / 월 단위(month) 달력",
      table: { defaultValue: { summary: "date" } },
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"], table: { defaultValue: { summary: "md" } } },
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
    mode: { table: { disable: true } },
  },
  render: (args) => <DateFieldSingleStory {...args} />,
  decorators: [
    (Story) => (
      <div style={{ width: 560, padding: 16, border: "1px dashed var(--semantic-neutral-border)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Omit<Meta<DateFieldSingleStoryArgs>, "component"> & {
  component: typeof DateFieldSingle;
};

export default meta;
type Story = StoryObj<DateFieldSingleStoryArgs>;

export const Default: Story = {};

export const Month: Story = {
  args: { label: "월", granularity: "month" },
};
