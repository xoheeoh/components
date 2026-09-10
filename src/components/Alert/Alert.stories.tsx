import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Button } from "../Button";
import { Alert } from "./Alert";

const meta = {
  title: "Components/Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    open: false,
    onClose: fn(),
    title: "알림",
    message: "작업을 계속 진행하시겠습니까?",
  },
  argTypes: {
    open: { table: { disable: true } },
    onClose: { table: { disable: true } },
    secondaryAction: { control: false },
    primaryAction: { control: false },
    destructiveAction: { control: false },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirm: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="Alert 열기" onClick={() => setOpen(true)} />
        <Alert
          open={open}
          onClose={() => setOpen(false)}
          title="저장하지 않은 변경 사항"
          message="이 페이지를 떠나면 변경 사항이 저장되지 않습니다."
          secondaryAction={{ label: "취소" }}
          primaryAction={{ label: "확인" }}
        />
      </>
    );
  },
};

export const Notice: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="Alert 열기" onClick={() => setOpen(true)} />
        <Alert
          open={open}
          onClose={() => setOpen(false)}
          title="안내"
          message="업데이트가 완료되었습니다."
          primaryAction={{ label: "확인" }}
        />
      </>
    );
  },
};

export const WithoutTitle: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="Alert 열기" onClick={() => setOpen(true)} />
        <Alert
          open={open}
          onClose={() => setOpen(false)}
          message="업데이트가 완료되었습니다."
          primaryAction={{ label: "확인" }}
        />
      </>
    );
  },
};

export const Destructive: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          variant="solid"
          color="destructive"
          label="회원 탈퇴"
          onClick={() => setOpen(true)}
        />
        <Alert
          open={open}
          onClose={() => setOpen(false)}
          title="정말 탈퇴하시겠습니까?"
          message={"탈퇴하면 모든 데이터가 삭제되며\n되돌릴 수 없습니다."}
          secondaryAction={{ label: "취소" }}
          destructiveAction={{ label: "탈퇴" }}
        />
      </>
    );
  },
};

export const ThreeActions: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          variant="outlined"
          color="neutral"
          label="세 가지 행동"
          onClick={() => setOpen(true)}
        />
        <Alert
          open={open}
          onClose={() => setOpen(false)}
          title="새 버전이 있습니다"
          message="지금 이동하거나, 나중에 다시 안내받을 수 있습니다."
          secondaryAction={{ label: "닫기" }}
          destructiveAction={{ label: "다시 보지 않기" }}
          primaryAction={{ label: "보러가기" }}
        />
      </>
    );
  },
};
