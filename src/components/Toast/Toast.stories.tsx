import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button";
import { Toast, ToastProvider, useToast } from "./Toast";

type ToastStoryArgs = ComponentProps<typeof Toast> & {
  duration: number;
  withAction: boolean;
};

const meta = {
  title: "Components/Feedback/Toast",
  component: Toast,
  tags: ["autodocs"],
  args: {
    message: "토스트 메시지",
    type: "info",
    position: "top",
    duration: 3000,
    withAction: false,
  },
  argTypes: {
    type: { control: "select", options: ["default", "success", "info", "warning", "error"] },
    position: { control: "inline-radio", options: ["top", "bottom"] },
    duration: { control: { type: "number", min: 0, step: 500 } },
    withAction: { control: "boolean", name: "action" },
    exiting: { table: { disable: true } },
    onExitComplete: { table: { disable: true } },
    onHoldStart: { table: { disable: true } },
    onHoldEnd: { table: { disable: true } },
    onAction: { table: { disable: true } },
  },
} satisfies Meta<ToastStoryArgs>;

export default meta;
type Story = StoryObj<ToastStoryArgs>;

function TypeButtons() {
  const toast = useToast();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Button
        variant="outlined"
        color="neutral"
        label="Default"
        onClick={() => toast("아이콘이 없는 기본 토스트입니다.")}
      />
      <Button
        variant="outlined"
        color="neutral"
        label="Success"
        onClick={() => toast.success("저장되었습니다.")}
      />
      <Button
        variant="outlined"
        color="neutral"
        label="Info"
        onClick={() => toast.info("새로운 업데이트가 있습니다.")}
      />
      <Button
        variant="outlined"
        color="neutral"
        label="Warning"
        onClick={() => toast.warning("주의가 필요합니다.")}
      />
      <Button
        variant="outlined"
        color="neutral"
        label="Error"
        onClick={() => toast.error("알 수 없는 오류가 발생했습니다.\n다시 시도해 주세요.")}
      />
      <Button
        variant="outlined"
        color="neutral"
        label="With Action"
        onClick={() =>
          toast.info("새로운 공지사항이 있습니다.", {
            action: { label: "보러가기", onClick: () => {} },
          })
        }
      />
    </div>
  );
}

function PlaygroundTrigger({
  message,
  type,
  duration,
  withAction,
}: Pick<ToastStoryArgs, "message" | "type" | "duration" | "withAction">) {
  const toast = useToast();
  return (
    <Button
      variant="outlined"
      color="neutral"
      label="토스트 보기"
      onClick={() =>
        toast(message, {
          type,
          duration,
          action: withAction ? { label: "보러가기", onClick: () => {} } : undefined,
        })
      }
    />
  );
}

export const Playground: Story = {
  parameters: {
    controls: { include: ["message", "type", "position", "duration", "withAction"] },
  },
  render: (args) => (
    <ToastProvider key={args.position} position={args.position}>
      <PlaygroundTrigger
        message={args.message}
        type={args.type}
        duration={args.duration}
        withAction={args.withAction}
      />
    </ToastProvider>
  ),
};

export const Types: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ToastProvider>
      <TypeButtons />
    </ToastProvider>
  ),
};

export const Static: Story = {
  args: { message: "정적 토스트 미리보기", type: "success" },
  parameters: { controls: { include: ["message", "type", "position"] } },
  render: (args) => <Toast message={args.message} type={args.type} position={args.position} />,
};
