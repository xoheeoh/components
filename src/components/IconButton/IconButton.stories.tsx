import { mdiBellOutline } from "@mdi/js";
import { IconButton } from "./IconButton";
import { Icon } from "../Icon/Icon";
import { StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

const meta = {
  title: "Components/Action/IconButton",
  component: IconButton,
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
    icon: <Icon path={mdiBellOutline} />,
    // 아이콘 svg는 aria-hidden이므로 aria-label 없이는 접근 가능한 이름이 없다.
    // IconButton에는 label prop이 없어 소비자가 반드시 넘겨야 한다 (axe button-name).
    "aria-label": "알림",
    variant: "default",
    size: "md",
    color: "neutral",
    disabled: false,
    iconSize: "",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "outlined", "solid"] },
    color: { control: "select", options: ["primary", "neutral", "destructive"] },
    size: { control: "text", description: "sm / md 또는 48px 같은 길이" },
    iconSize: { control: "text", description: "아이콘 한 변. 비우면 size에 맞춰 자동" },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
    icon: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/*
 * ===== 동작 보장 테스트 =====
 * 문서용 예시가 아니라, 고쳐놓은 동작이 그대로 유지되는지 자동으로 확인하는 스토리다.
 * `npm test`로 실행된다. 문서(autodocs)에는 나오지 않는다.
 */

/**
 * type 기본값이 없어 DOM 기본값인 type="submit"이 적용됐고,
 * 폼 안의 IconButton을 클릭하면 폼이 제출됐다.
 */
export const DoesNotSubmitForm: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  render: (args) => (
    // preventDefault를 하지 않는다. 제출이 일어나면 play의 리스너가 잡아야 하기 때문이다.
    <form data-testid="host-form" onSubmit={(event) => event.preventDefault()}>
      <IconButton {...args} aria-label="폼 안의 버튼" />
    </form>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "폼 안의 버튼" });

    // 기본값이 없으면 브라우저가 type="submit"으로 해석한다.
    await expect(button).toHaveAttribute("type", "button");

    const submitted = fn();
    canvas.getByTestId("host-form").addEventListener("submit", submitted);

    await userEvent.click(button);
    await expect(submitted).not.toHaveBeenCalled();

    // 키보드 활성화(Enter)로도 제출되지 않아야 한다.
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(submitted).not.toHaveBeenCalled();
  },
};

/** 소비자가 넘긴 type이 기본값에 덮이지 않아야 한다 ({...rest} 전개 순서). */
export const RespectsExplicitType: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  render: (args) => <IconButton {...args} type="submit" aria-label="제출 버튼" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "제출 버튼" })).toHaveAttribute("type", "submit");
  },
};
