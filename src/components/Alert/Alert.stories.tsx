import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./Alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    type: { control: "select", options: ["success", "info", "warning", "error"] },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { message: "저장되었습니다", type: "success" },
};

export const Info: Story = {
  args: { message: "새로운 업데이트가 있습니다", type: "info" },
};

export const Error: Story = {
  args: { message: "요청 처리 중 오류가 발생했습니다", type: "error" },
};

export const WithDetail: Story = {
  args: {
    message: "API 응답 오류",
    type: "warning",
    children: "HTTP 500 Internal Server Error",
  },
};
