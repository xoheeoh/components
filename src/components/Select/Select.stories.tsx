import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Select, type SelectProps } from "./Select";

const options = [
  { value: "apple", label: "사과" },
  { value: "banana", label: "바나나" },
  { value: "orange", label: "오렌지", disabled: true },
];

const fruitOptions = [
  { value: "strawberry", label: "딸기" },
  { value: "orange", label: "오렌지" },
  { value: "grape", label: "포도" },
  { value: "apple", label: "사과" },
  { value: "banana", label: "바나나" },
];

function SelectStory(args: SelectProps) {
  const isMultiple = args.multiple || args.type === "chip";
  const [value, setValue] = useState<string | string[]>(() =>
    isMultiple ? (Array.isArray(args.value) ? args.value : []) : typeof args.value === "string" ? args.value : ""
  );

  if (isMultiple) {
    return (
      <Select
        {...args}
        type={args.type === "chip" ? "chip" : "text"}
        multiple
        value={Array.isArray(value) ? value : []}
        onValueChange={setValue}
      />
    );
  }

  return (
    <Select
      {...args}
      type="text"
      multiple={false}
      value={typeof value === "string" ? value : ""}
      onValueChange={setValue}
    />
  );
}

const meta = {
  title: "Components/Form/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    label: "과일",
    type: "text",
    status: "default",
    statusBadge: true,
    size: "md",
    required: false,
    description: "",
    overflow: false,
    options,
    placeholder: "선택하세요",
  },
  argTypes: {
    label: { control: "text", description: "라벨값. 빈 값인 경우 자동 숨김처리" },
    type: {
      control: "inline-radio",
      options: ["text", "chip"],
      description:
        "표시 형태. text는 텍스트, chip은 칩(복수). 단일 선택은 text만 사용하며 chip을 넘겨도 텍스트로 표시됨",
    },
    status: {
      control: "select",
      options: ["default", "positive", "negative"],
      description: "입력 필드 상태값. (예: error 발생 시 negative 사용)",
    },
    statusBadge: {
      control: "boolean",
      description: "상태값에 따른 뱃지. status가 default인 경우엔 보이지 않음",
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    required: { control: "boolean", description: "필수 입력 필드 여부" },
    description: { control: "text", description: "도움말 텍스트" },
    disabled: { table: { disable: true } },
    overflow: {
      control: "boolean",
      description: "선택값 표시 방식. false면 한 줄 + 말줄임, true면 너비를 넘길 때 줄바꿈",
    },
    multiple: {
      control: "boolean",
      description: "복수 선택 여부. type이 chip이면 생략해도 복수 선택으로 동작함",
    },
    placeholder: { control: "text" },
    value: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
    style: { control: "object", description: "inline style. 예: `{ width: 200 }`" },
    className: { table: { disable: true } },
  },
  render: (args) => <SelectStory {...args} />,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: "apple", description: "주문할 과일 종류를 선택해 주세요." },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const FixedWidth: Story = {
  args: { style: { width: 200 } },
};

export const Multiple: Story = {
  args: {
    multiple: true,
    overflow: false,
    options: fruitOptions,
    value: ["strawberry", "orange", "grape"],
    style: { width: 200 },
    placeholder: "과일을 선택하세요",
  },
};

export const MultipleOverflow: Story = {
  args: {
    multiple: true,
    overflow: true,
    options: fruitOptions,
    value: ["strawberry", "orange", "grape"],
    style: { width: 200 },
    placeholder: "과일을 선택하세요",
  },
};

export const ChipOverflow: Story = {
  args: {
    type: "chip",
    overflow: true,
    options: fruitOptions,
    value: ["strawberry", "orange", "grape", "apple"],
    style: { width: 200 },
    placeholder: "과일을 선택하세요",
  },
};
