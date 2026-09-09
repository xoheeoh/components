import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Select, type SelectProps } from "./Select";
import { expect, screen, userEvent } from "storybook/test";

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
  parameters: {
    a11y: {
      // 이 컴포넌트는 접근성 문제를 `npm test` 실패로 잡는다 (전역 기본값은 "todo" — 보고만 하고 통과).
      test: "error",
      // color-contrast(색 대비)는 의도적으로 검사하지 않는다 (프로젝트 결정).
      // 여기서 막는 것은 구조적 접근성 — 라벨 연결, 역할, 접근 가능한 이름이다.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
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

/*
 * ===== 동작 보장 테스트 =====
 * 문서용 예시가 아니라, 고쳐놓은 동작이 그대로 유지되는지 자동으로 확인하는 스토리다.
 * `npm test`로 실행된다. 문서(autodocs)에는 나오지 않는다.
 */

/**
 * onKeyDown이 하나도 없어서 키보드로 값을 선택할 방법이 아예 없었다.
 * 선택이 <li onClick> 뿐이라 키보드에서는 발동하지 않았다.
 */
export const SelectsWithKeyboard: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: /과일/ });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    // 키보드로 트리거에 도달해 ArrowDown으로 연다.
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    // 목록과 활성 옵션이 시맨틱으로 연결됐는지.
    // listbox는 document.body로 포털되므로 screen으로 조회한다.
    const listbox = await screen.findByRole("listbox");
    await expect(trigger).toHaveAttribute("aria-controls", listbox.id);
    await expect(trigger.getAttribute("aria-activedescendant")).toBeTruthy();

    // 이동 후 Enter로 확정 → 닫히고 포커스가 트리거로 돌아온다.
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveTextContent("바나나");
  },
};

/** disabled 옵션은 키보드 이동에서 건너뛰어야 한다 (오렌지가 disabled). */
export const SkipsDisabledOption: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: /과일/ });
    await userEvent.tab();
    // 마지막 항목으로 이동 — 오렌지가 disabled라 바나나에 머물러야 한다.
    await userEvent.keyboard("{ArrowDown}{End}{Enter}");
    await expect(trigger).toHaveTextContent("바나나");
  },
};

/** Escape로 닫히고 포커스가 트리거에 남아야 한다. */
export const RestoresFocusOnEscape: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: /과일/ });
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveFocus();
  },
};

/**
 * 마우스로 열면 활성 항목을 만들지 않는다.
 * 활성 표시는 키보드 조작의 산물이므로 마우스로 열었을 때 링이 보이면 안 된다.
 */
export const MouseOpenHasNoActiveOption: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: /과일/ });

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(trigger).not.toHaveAttribute("aria-activedescendant");

    // 화살표를 누르면 그때 활성 항목이 생긴다.
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger.getAttribute("aria-activedescendant")).toBeTruthy();
  },
};

/**
 * controlled 전용인데 value/onValueChange가 optional이라
 * <Select options> 가 타입 체크를 통과하고도 선택이 반영되지 않았다.
 */
export const SelectsWithoutValueProp: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  render: () => <Select label="과일" options={options} placeholder="선택하세요" />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: /과일/ });
    await expect(trigger).toHaveTextContent("선택하세요");

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("option", { name: "사과" }));

    // value를 넘기지 않았어도 내부 상태가 선택을 기억해야 한다.
    await expect(trigger).toHaveTextContent("사과");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};
