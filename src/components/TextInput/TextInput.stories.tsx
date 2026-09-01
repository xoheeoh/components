import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextInput } from "./TextInput";

const meta = {
  title: "Components/Form/TextInput",
  component: TextInput,
  tags: ["autodocs"],
  args: {
    label: "이름",
    placeholder: "이름을 입력해 주세요.",
    status: "default",
    statusBadge: true,
    size: "md",
    required: false,
    description: "",
    disabled: false,
    type: "text",
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    status: { control: "select", options: ["default", "positive", "negative"] },
    statusBadge: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    required: { control: "boolean" },
    description: { control: "text" },
    disabled: { table: { disable: true } },
    type: { control: "text" },
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "이름" },
};

export const TypeSearch: Story = {
  args: { label: "검색어", type: "search", placeholder: "검색어를 입력하세요." },
};

export const TypeFile: Story = {
  args: { label: "첨부파일", type: "file", multiple: true, placeholder: "파일을 선택하세요." },
};

export const TypePassword: Story = {
  args: {
    label: "비밀번호",
    type: "password",
    placeholder: "비밀번호를 입력하세요.",
    description: "영문, 숫자, 특수문자 조합 8자 이상",
  },
};
