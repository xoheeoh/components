import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { mdiCalendar, mdiCalendarMonth, mdiCalendarWeek } from "@mdi/js";
import { Icon } from "../Icon";
import { SegmentedControl, type SegmentedControlProps } from "./index";

const PERIODS = [
  { value: "day", label: "일" },
  { value: "week", label: "주" },
  { value: "month", label: "월" },
];

function SegmentedControlStory(args: SegmentedControlProps) {
  const [selected, setSelected] = useState<string | undefined>(
    () => args.value ?? args.defaultValue ?? PERIODS[0]?.value,
  );

  return (
    <SegmentedControl
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
  title: "Components/Form/SegmentedControl",
  component: SegmentedControl,
  render: (args) => <SegmentedControlStory {...args} />,
  tags: ["autodocs"],
  args: {
    label: "조회 기간",
    options: PERIODS,
    type: "solid",
    size: "md",
    fullWidth: false,
  },
  argTypes: {
    type: { control: "inline-radio", options: ["solid", "outlined"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    fullWidth: { control: "boolean" },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    onChange: { table: { disable: true } },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outlined: Story = {
  args: { type: "outlined" },
};

export const WithIcon: Story = {
  args: {
    options: [
      { value: "day", label: "일", icon: <Icon path={mdiCalendar} /> },
      { value: "week", label: "주", icon: <Icon path={mdiCalendarWeek} /> },
      {
        value: "month",
        label: "월",
        icon: <Icon path={mdiCalendarMonth} />,
        iconPosition: "right",
      },
    ],
  },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
};
