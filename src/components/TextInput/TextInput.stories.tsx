import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextInput } from "./TextInput";
import { expect, userEvent } from "storybook/test";

const meta = {
  title: "Components/Form/TextInput",
  component: TextInput,
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
    label: "이름",
    placeholder: "이름을 입력해 주세요.",
    status: "default",
    statusBadge: true,
    size: "md",
    required: false,
    description: "",
    disabled: false,
    type: "text",
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    status: { control: "select", options: ["default", "positive", "negative"] },
    statusBadge: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    required: { control: "boolean" },
    description: { control: "text" },
    disabled: { table: { disable: true } },
    type: { control: "text" },
    style: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "이름" },
};

export const TypeSearch: Story = {
  args: { label: "검색어", type: "search", placeholder: "검색어를 입력하세요." },
};

export const TypeFile: Story = {
  args: { label: "첨부파일", type: "file", multiple: true, placeholder: "파일을 선택하세요." },
};

export const TypePassword: Story = {
  args: {
    label: "비밀번호",
    type: "password",
    placeholder: "비밀번호를 입력하세요.",
    description: "영문, 숫자, 특수문자 조합 8자 이상",
  },
};

export const FixedWidth: Story = {
  args: { style: { width: 200 } },
};

/*
 * ===== 동작 보장 테스트 =====
 * 문서용 예시가 아니라, 고쳐놓은 동작이 그대로 유지되는지 자동으로 확인하는 스토리다.
 * `npm test`로 실행된다. 문서(autodocs)에는 나오지 않는다.
 */

/**
 * 라벨이 연결되지 않은 <span>이라 컨트롤에 접근 가능한 이름이 없었다.
 * 스크린리더에서 "편집 텍스트, 비어 있음"으로만 읽히고 라벨 클릭도 동작하지 않았다.
 */
export const HasAccessibleName: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  args: {
    label: "이메일",
    required: true,
    status: "negative",
    description: "형식이 올바르지 않습니다",
  },
  play: async ({ canvas }) => {
    // 이름으로 조회되면 label이 프로그램적으로 연결됐다는 뜻이다.
    const input = canvas.getByRole("textbox", { name: "이메일" });

    await expect(input).toHaveAttribute("aria-required", "true");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toBeRequired();

    // description이 aria-describedby로 연결됐는지 — 실제 텍스트까지 확인한다.
    await expect(input).toHaveAccessibleDescription("형식이 올바르지 않습니다");

    // 라벨 클릭으로 포커스가 이동해야 한다.
    await userEvent.click(canvas.getByText("이메일"));
    await expect(input).toHaveFocus();
  },
};

/** 여러 개를 렌더해도 useId 덕분에 id가 충돌하지 않아야 한다. */
export const HasUniqueIds: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  render: () => (
    <>
      <TextInput label="첫 번째" description="설명 1" />
      <TextInput label="두 번째" description="설명 2" />
    </>
  ),
  play: async ({ canvas }) => {
    const first = canvas.getByRole("textbox", { name: "첫 번째" });
    const second = canvas.getByRole("textbox", { name: "두 번째" });

    await expect(first.id).not.toBe(second.id);
    await expect(first).toHaveAccessibleDescription("설명 1");
    await expect(second).toHaveAccessibleDescription("설명 2");
  },
};
