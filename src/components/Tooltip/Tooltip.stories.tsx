import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { mdiInformationOutline } from "@mdi/js";
import { Icon } from "../Icon";
import {
  Tooltip,
  type ArrowPosition,
  type HorizontalAlign,
  type TooltipPosition,
  type TooltipSize,
  type VerticalAlign,
} from "./Tooltip";

function DemoTrigger({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--semantic-label-alternative)",
        cursor: "help",
        border: "1px dashed var(--semantic-neutral-border)",
        borderRadius: "var(--r-sm)",
        padding: "16px",
      }}>
      {children}
    </span>
  );
}

type TooltipStoryArgs = {
  content: string;
  children: ReactNode;
  position: TooltipPosition;
  size?: TooltipSize;
  arrow: ArrowPosition;
  verticalAlign?: VerticalAlign;
  horizontalAlign?: HorizontalAlign;
  theme?: "light" | "dark";
};

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  args: {
    content: "트리거에 대한 설명을 작성합니다.",
    children: (
      <DemoTrigger>
        <Icon path={mdiInformationOutline} size={20} />
      </DemoTrigger>
    ),
    position: "top",
    size: "md",
    arrow: "vertical",
    verticalAlign: "leading",
    horizontalAlign: "top",
    theme: "light",
  },
  argTypes: {
    position: { control: "select", options: ["top", "right", "bottom", "left"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    arrow: { control: "inline-radio", options: ["vertical", "horizontal"] },
    align: { table: { disable: true } },
    verticalAlign: {
      name: "align",
      control: "select",
      options: ["leading", "center", "trailing"],
      if: { arg: "arrow", eq: "vertical" },
    },
    horizontalAlign: {
      name: "align",
      control: "select",
      options: ["top", "center", "bottom"],
      if: { arg: "arrow", eq: "horizontal" },
    },
    content: { control: "text" },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
    theme: { control: "inline-radio", options: ["light", "dark"] },
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Story />
      </div>
    ),
  ],
  render: ({ verticalAlign, horizontalAlign, arrow, ...args }) =>
    arrow === "vertical" ? (
      <Tooltip {...args} arrow="vertical" align={verticalAlign ?? "leading"} />
    ) : (
      <Tooltip {...args} arrow="horizontal" align={horizontalAlign ?? "top"} />
    ),
} as Meta<TooltipStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Positions: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gridTemplateRows: "auto auto auto",
        columnGap: 96,
        rowGap: 64,
        alignItems: "center",
        justifyItems: "center",
        width: 360,
      }}>
      <div style={{ gridColumn: 2, gridRow: 1 }}>
        <Tooltip content="위쪽" position="top" arrow="vertical" align="center">
          <DemoTrigger>Top</DemoTrigger>
        </Tooltip>
      </div>
      <div style={{ gridColumn: 1, gridRow: 2 }}>
        <Tooltip content="왼쪽" position="left" arrow="horizontal" align="center">
          <DemoTrigger>Left</DemoTrigger>
        </Tooltip>
      </div>
      <div style={{ gridColumn: 3, gridRow: 2 }}>
        <Tooltip content="오른쪽" position="right" arrow="horizontal" align="center">
          <DemoTrigger>Right</DemoTrigger>
        </Tooltip>
      </div>
      <div style={{ gridColumn: 2, gridRow: 3 }}>
        <Tooltip content="아래쪽" position="bottom" arrow="vertical" align="center">
          <DemoTrigger>Bottom</DemoTrigger>
        </Tooltip>
      </div>
    </div>
  ),
};

export const AlignVertical: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 64, justifyContent: "center" }}>
      <Tooltip content="leading" position="top" arrow="vertical" align="leading">
        <DemoTrigger>Leading</DemoTrigger>
      </Tooltip>
      <Tooltip content="center" position="top" arrow="vertical" align="center">
        <DemoTrigger>Center</DemoTrigger>
      </Tooltip>
      <Tooltip content="trailing" position="top" arrow="vertical" align="trailing">
        <DemoTrigger>Trailing</DemoTrigger>
      </Tooltip>
    </div>
  ),
};

export const AlignHorizontal: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 96, justifyContent: "center" }}>
      <Tooltip
        content={
          <>
            화살표가 위쪽에 붙습니다.
            <br />
            여러 줄이면 차이가 보여요.
            <br />
            top / center / bottom
          </>
        }
        position="right"
        arrow="horizontal"
        align="top">
        <DemoTrigger>Top</DemoTrigger>
      </Tooltip>
      <Tooltip
        content={
          <>
            화살표가 세로 중앙에 옵니다.
            <br />
            여러 줄이면 차이가 보여요.
            <br />
            top / center / bottom
          </>
        }
        position="right"
        arrow="horizontal"
        align="center">
        <DemoTrigger>Center</DemoTrigger>
      </Tooltip>
      <Tooltip
        content={
          <>
            화살표가 아래쪽에 붙습니다.
            <br />
            여러 줄이면 차이가 보여요.
            <br />
            top / center / bottom
          </>
        }
        position="right"
        arrow="horizontal"
        align="bottom">
        <DemoTrigger>Bottom</DemoTrigger>
      </Tooltip>
    </div>
  ),
};
