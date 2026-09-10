import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
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

/**
 * 라디오 그룹처럼 Tab 키 정지점은 하나(선택된 세그먼트)이고,
 * 안에서는 화살표 / Home / End로 이동하면서 바로 선택된다. 양끝에서는 순환한다.
 */
export const KeyboardNavigation: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  play: async ({ canvas }) => {
    const [day, week, month] = canvas.getAllByRole("radio");

    await expect(day).toHaveAttribute("tabindex", "0");
    await expect(week).toHaveAttribute("tabindex", "-1");
    await expect(month).toHaveAttribute("tabindex", "-1");

    await userEvent.click(day);
    await userEvent.keyboard("{ArrowRight}");
    await expect(week).toHaveFocus();
    await expect(week).toHaveAttribute("aria-checked", "true");

    // ↓도 다음으로 이동 (라디오 그룹 관례)
    await userEvent.keyboard("{ArrowDown}");
    await expect(month).toHaveFocus();
    await expect(month).toHaveAttribute("aria-checked", "true");

    // 마지막에서 → 는 첫 번째로 순환
    await userEvent.keyboard("{ArrowRight}");
    await expect(day).toHaveFocus();
    await expect(day).toHaveAttribute("aria-checked", "true");

    await userEvent.keyboard("{End}");
    await expect(month).toHaveFocus();

    // Tab 키는 그룹을 빠져나간다.
    await userEvent.tab();
    await expect(day).not.toHaveFocus();
    await expect(week).not.toHaveFocus();
    await expect(month).not.toHaveFocus();
  },
};
