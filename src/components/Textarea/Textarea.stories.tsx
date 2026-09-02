import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";

const meta = {
  title: "Components/Form/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    label: "문의 내용",
    status: "default",
    statusBadge: true,
    size: "md",
    required: false,
    description: "최대한 상세하게 작성해주세요.",
    placeholder: "내용을 입력하세요.",
    resize: "resizable",
    characterCount: false,
  },
  argTypes: {
    label: { control: "text" },
    status: { control: "select", options: ["default", "positive", "negative"] },
    statusBadge: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    required: { control: "boolean" },
    description: { control: "text" },
    disabled: { table: { disable: true } },
    placeholder: { control: "text" },
    resize: { control: "inline-radio", options: ["fixed", "resizable"] },
    fixedHeight: { control: "number" },
    characterCount: { control: "boolean" },
    maxLength: { control: "number" },
    style: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { label: "설명", status: "negative", description: "필수 항목입니다" },
};

export const WithCharacterCount: Story = {
  args: { label: "메모", characterCount: true, maxLength: 200, rows: 3 },
};

export const FixedHeight: Story = {
  args: { label: "메모", resize: "fixed", fixedHeight: 100, description: "" },
};

export const Disabled: Story = {
  args: { label: "비활성", disabled: true, value: "수정할 수 없습니다", description: "", rows: 3 },
};

export const FixedWidth: Story = {
  args: { style: { width: 400 }, rows: 3 },
};
