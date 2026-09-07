import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination, type PaginationDotColor, type PaginationDotSize, type PaginationType } from "./Pagination";

type PaginationStoryArgs = {
  type: PaginationType;
  count: number;
  visibleCount?: number;
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
  size?: PaginationDotSize;
  color?: PaginationDotColor;
};

function PaginationStory(args: PaginationStoryArgs) {
  const [page, setPage] = useState(args.page ?? args.defaultPage ?? 1);
  const { size, color, ...rest } = args;

  const handleChange = (next: number) => {
    setPage(next);
    args.onChange?.(next);
  };

  if (args.type === "dot") {
    return (
      <Pagination
        {...rest}
        type="dot"
        size={size ?? "md"}
        color={color ?? "primary"}
        page={page}
        onChange={handleChange}
      />
    );
  }

  return <Pagination {...rest} type="number" page={page} onChange={handleChange} />;
}

const meta = {
  title: "Components/Navigation/Pagination",
  component: Pagination,
  render: (args) => <PaginationStory {...args} />,
  tags: ["autodocs"],
  args: {
    type: "number",
    count: 20,
    visibleCount: 5,
    defaultPage: 1,
    size: "md",
    color: "primary",
  },
  argTypes: {
    type: { control: "inline-radio", options: ["dot", "number"] },
    size: {
      control: "inline-radio",
      options: ["sm", "md"],
      if: { arg: "type", eq: "dot" },
    },
    color: {
      control: "inline-radio",
      options: ["neutral", "primary"],
      if: { arg: "type", eq: "dot" },
    },
    count: { control: { type: "number", min: 1, max: 50 } },
    visibleCount: { control: { type: "number", min: 1, max: 10 } },
    page: { table: { disable: true } },
    defaultPage: { table: { disable: true } },
    onChange: { table: { disable: true } },
  },
} as Meta<PaginationStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Number: Story = {};

export const Dot: Story = {
  args: { type: "dot" },
};
