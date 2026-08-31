import type { Meta, StoryObj } from "@storybook/react-vite";
import { Banner } from "./Banner";

const meta = {
  title: "Components/Feedback/Banner",
  component: Banner,
  tags: ["autodocs"],
  argTypes: {
    type: { control: "select", options: ["success", "info", "warning", "error"] },
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { message: "저장되었습니다.", type: "success" },
};

export const Info: Story = {
  args: { message: "새로운 업데이트가 있습니다!", type: "info" },
};

export const Error: Story = {
  args: { message: "요청 처리 중 오류가 발생했습니다.\n다시 시도해 주세요.", type: "error" },
};

export const WithDetailMessage: Story = {
  args: {
    message: "API 응답 오류",
    type: "warning",
    detailMessage: "HTTP 500 Internal Server Error",
  },
};
