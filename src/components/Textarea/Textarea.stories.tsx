import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";
import { expect, userEvent } from "storybook/test";

const meta = {
  title: "Components/Form/Textarea",
  component: Textarea,
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
    label: "문의 내용",
    status: "default",
    statusBadge: true,
    size: "md",
    required: false,
    description: "최대한 상세하게 작성해주세요.",
    placeholder: "내용을 입력하세요.",
    resize: "resizable",
    characterCount: false,
  },
  argTypes: {
    label: { control: "text" },
    status: { control: "select", options: ["default", "positive", "negative"] },
    statusBadge: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    required: { control: "boolean" },
    description: { control: "text" },
    disabled: { table: { disable: true } },
    placeholder: { control: "text" },
    resize: { control: "inline-radio", options: ["fixed", "resizable"] },
    fixedHeight: { control: "number" },
    characterCount: { control: "boolean" },
    maxLength: { control: "number" },
    style: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { label: "설명", status: "negative", description: "필수 항목입니다" },
};

export const WithCharacterCount: Story = {
  args: { label: "메모", characterCount: true, maxLength: 200, rows: 3 },
};

export const FixedHeight: Story = {
  args: { label: "메모", resize: "fixed", fixedHeight: 100, description: "" },
};

export const Disabled: Story = {
  args: { label: "비활성", disabled: true, value: "수정할 수 없습니다", description: "", rows: 3 },
};

export const FixedWidth: Story = {
  args: { style: { width: 400 }, rows: 3 },
};

/*
 * ===== 동작 보장 테스트 =====
 * 문서용 예시가 아니라, 고쳐놓은 동작이 그대로 유지되는지 자동으로 확인하는 스토리다.
 * `npm test`로 실행된다. 문서(autodocs)에는 나오지 않는다.
 */

/**
 * TextInput과 동일한 문제 — 연결되지 않은 <span> 라벨.
 * 추가로 required prop이 native 속성으로 전달되지 않아 브라우저 검증이 동작하지 않았다.
 */
export const HasAccessibleName: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  args: { label: "문의 내용", required: true, status: "negative", description: "필수 항목입니다" },
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole("textbox", { name: "문의 내용" });

    await expect(textarea).toHaveAttribute("aria-required", "true");
    await expect(textarea).toHaveAttribute("aria-invalid", "true");
    // required가 native 속성으로 전달되지 않아 브라우저 폼 검증이 동작하지 않던 문제.
    await expect(textarea).toBeRequired();

    await expect(textarea).toHaveAccessibleDescription("필수 항목입니다");

    await userEvent.click(canvas.getByText("문의 내용"));
    await expect(textarea).toHaveFocus();
  },
};
