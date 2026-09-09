import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { mdiPlus } from "@mdi/js";
import { Icon } from "../Icon";
import { Button } from "./Button";

const meta = {
  title: "Components/Action/Button",
  component: Button,
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
    onClick: fn(),
    label: "버튼",
    type: "button",
    variant: "solid",
    size: "md",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    label: { control: "text" },
    type: { control: "inline-radio", options: ["button", "submit", "reset"] },
    variant: {
      control: "select",
      options: ["solid", "outlined"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    color: { control: "select", options: ["primary", "neutral", "destructive"] },
    disabled: { control: "boolean" },
    style: { table: { disable: true } },
    className: { table: { disable: true } },
    loading: { table: { disable: true } },
    icon: { table: { disable: true } },
    iconPosition: { table: { disable: true } },
    iconOnly: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Button {...args} />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button variant="outlined" color="neutral" size="sm" label="Small" />
      <Button variant="outlined" color="neutral" size="md" label="Medium" />
      <Button variant="outlined" color="neutral" size="lg" label="Large" />
    </div>
  ),
};

export const Loading: Story = {
  render: (args) => <Button {...args} loading />,
};

export const WithIcon: Story = {
  render: (args) => (
    <Button
      {...args}
      size="md"
      label="추가하기"
      icon={<Icon path={mdiPlus} size={20} style={{ marginBottom: 1 }} />}
      iconPosition="right"
    />
  ),
};

export const IconOnly: Story = {
  render: (args) => <Button {...args} iconOnly icon={<Icon path={mdiPlus} size={20} />} />,
};

/*
 * ===== 동작 보장 테스트 =====
 * 문서용 예시가 아니라, 고쳐놓은 동작이 그대로 유지되는지 자동으로 확인하는 스토리다.
 * `npm test`로 실행된다. 문서(autodocs)에는 나오지 않는다.
 */

/**
 * `.button:focus-visible { outline: none }`이 키보드 포커스 표시를 지우고 있었다 (WCAG 2.4.7).
 * 키보드 포커스 시 실제로 링이 그려지는지 확인한다.
 */
export const KeepsFocusRing: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  render: (args) => <Button {...args} label="포커스 대상" />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "포커스 대상" });

    // 마우스 클릭이 아니라 키보드로 포커스를 줘야 :focus-visible이 매칭된다.
    await userEvent.tab();
    await expect(button).toHaveFocus();

    const ring = getComputedStyle(button);
    await expect(ring.outlineStyle).toBe("solid");
    await expect(ring.outlineWidth).toBe("2px");
    // outline: none이면 색이 비거나 style이 none이 된다.
    await expect(ring.outlineColor).not.toBe("transparent");
    await expect(ring.outlineColor).not.toBe("");
  },
};
