import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";
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

/**
 * 달력 팝오버는 body 끝에 포털되어 Tab 순서로는 도달할 수 없다.
 * 열면 포커스가 달력 안으로 들어가고, Tab은 안에서 순환하며,
 * Escape나 날짜 선택으로 닫히면 "달력 열기" 버튼으로 돌아와야 한다.
 */
export const KeyboardCalendar: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  render: (args) => <DateFieldSingleStory {...args} />,
  play: async ({ canvas }) => {
    const opener = canvas.getByRole("button", { name: "달력 열기" });
    const input = canvas.getByRole("textbox");

    await userEvent.click(opener);
    // 팝오버는 document.body로 포털되므로 canvas가 아니라 screen으로 조회한다.
    let dialog = await screen.findByRole("dialog", { name: "날짜 선택" });
    await expect(opener).toHaveAttribute("aria-expanded", "true");
    // 열리면 포커스가 달력 안(오늘 날짜)으로 들어간다.
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    // Tab을 여러 번 눌러도 팝오버 안에서 순환한다.
    for (let i = 0; i < 6; i += 1) {
      await userEvent.tab();
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }

    // Escape → 닫히고 버튼으로 복귀
    await userEvent.keyboard("{Escape}");
    await expect(dialog).not.toBeInTheDocument();
    await expect(opener).toHaveFocus();

    // 다시 열어 Enter로 포커스된 날짜(오늘)를 선택 → 값이 들어가고 버튼으로 복귀
    await userEvent.click(opener);
    dialog = await screen.findByRole("dialog", { name: "날짜 선택" });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard("{Enter}");
    await expect(dialog).not.toBeInTheDocument();
    await expect((input as HTMLInputElement).value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await expect(opener).toHaveFocus();
  },
};
