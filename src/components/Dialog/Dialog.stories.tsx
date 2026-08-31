import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Button } from "../Button";
import { Dialog } from "./Dialog";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  args: {
    open: false,
    onClose: fn(),
    title: "제목을 입력하세요",
    description: "설명을 입력하세요. 필요 없으면 description을 비우면 됩니다.",
    size: "md",
    closeOnOverlayClick: true,
    showCloseButton: true,
  },
  argTypes: {
    title: { control: "text", description: "다이얼로그 제목" },
    description: { control: "text", description: "제목 아래 보조 설명. 비우면 숨김." },
    size: { control: "inline-radio", options: ["sm", "md", "lg"], description: "패널 너비 (기본값 md)" },
    closeOnOverlayClick: { control: "boolean", description: "오버레이 클릭 시 닫힘 여부" },
    showCloseButton: { control: "boolean", description: "헤더 오른쪽 닫기 버튼 표시 여부" },
    footer: {
      control: false,
      description: "하단 버튼 영역. (ReactNode라 패널에서 수정 불가)",
      table: { type: { summary: "ReactNode" } },
    },
    open: { table: { disable: true } },
    onClose: { table: { disable: true } },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
    role: { table: { disable: true } },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    controls: {
      include: ["title", "description", "size", "closeOnOverlayClick", "showCloseButton", "footer"],
    },
  },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="다이얼로그 열기" onClick={() => setOpen(true)} />
        <Dialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button variant="outlined" color="neutral" label="취소" onClick={() => setOpen(false)} />
              <Button variant="solid" color="primary" label="확인" onClick={() => setOpen(false)} />
            </>
          }>
          <p className="text-body2" style={{ margin: 0 }}>
            본문 영역입니다. 폼이나 긴 내용이 들어갑니다.
          </p>
        </Dialog>
      </>
    );
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [size, setSize] = useState<"sm" | "md" | "lg" | null>(null);
    return (
      <>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outlined" color="neutral" label="Small" onClick={() => setSize("sm")} />
          <Button variant="outlined" color="neutral" label="Medium" onClick={() => setSize("md")} />
          <Button variant="outlined" color="neutral" label="Large" onClick={() => setSize("lg")} />
        </div>
        {size ? (
          <Dialog
            open
            onClose={() => setSize(null)}
            size={size}
            title={`${size.toUpperCase()} 크기`}
            footer={<Button variant="outlined" color="neutral" label="닫기" onClick={() => setSize(null)} />}>
            <p className="text-body2" style={{ margin: 0 }}>
              size=&quot;{size}&quot;
            </p>
          </Dialog>
        ) : null}
      </>
    );
  },
};
