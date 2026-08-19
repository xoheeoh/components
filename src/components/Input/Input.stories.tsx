import type { Meta, StoryObj } from "@storybook/react-vite";
import { mdiMagnify } from "@mdi/js";
import { Icon } from "../Icon";
import { Input } from "./Input";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: { placeholder: "입력하세요" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    align: { control: "select", options: ["left", "right"] },
    description: { control: "text" },
    icon: { control: false },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "이름" },
};

export const WithErrorDescription: Story = {
  args: { label: "이메일", error: true, description: "유효하지 않은 이메일 주소입니다.", value: "invalid" },
};

export const WithIcon: Story = {
  args: {
    size: "lg",
    icon: <Icon path={mdiMagnify} />,
    placeholder: "검색어를 입력하세요",
  },
};

export const TypeFile: Story = {
  args: { label: "첨부파일", type: "file", multiple: true, placeholder: "파일을 선택하세요" },
};

export const TypePassword: Story = {
  args: { label: "비밀번호", type: "password", showActionButtons: true, placeholder: "비밀번호를 입력하세요." },
};
