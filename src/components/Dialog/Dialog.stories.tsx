import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fireEvent, fn, screen, userEvent, waitFor } from "storybook/test";
import { Button } from "../Button";
import { Dialog } from "./Dialog";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
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
    open: false,
    onClose: fn(),
    title: "제목을 입력하세요",
    description: "설명을 입력하세요. 필요 없으면 description을 비우면 됩니다.",
    size: "md",
    closeOnOverlayClick: true,
    showCloseButton: true,
  },
  argTypes: {
    title: { control: "text", description: "다이얼로그 제목" },
    description: { control: "text", description: "제목 아래 보조 설명. 비우면 숨김." },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      description: "패널 너비 (기본값 md)",
    },
    closeOnOverlayClick: { control: "boolean", description: "오버레이 클릭 시 닫힘 여부" },
    showCloseButton: { control: "boolean", description: "헤더 오른쪽 닫기 버튼 표시 여부" },
    footer: {
      control: false,
      description: "하단 버튼 영역. (ReactNode라 패널에서 수정 불가)",
      table: { type: { summary: "ReactNode" } },
    },
    open: { table: { disable: true } },
    onClose: { table: { disable: true } },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
    role: { table: { disable: true } },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    controls: {
      include: ["title", "description", "size", "closeOnOverlayClick", "showCloseButton", "footer"],
    },
  },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="다이얼로그 열기" onClick={() => setOpen(true)} />
        <Dialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button
                variant="outlined"
                color="neutral"
                label="취소"
                onClick={() => setOpen(false)}
              />
              <Button variant="solid" color="primary" label="확인" onClick={() => setOpen(false)} />
            </>
          }
        >
          <p className="text-body2" style={{ margin: 0 }}>
            본문 영역입니다. 폼이나 긴 내용이 들어갑니다.
          </p>
        </Dialog>
      </>
    );
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [size, setSize] = useState<"sm" | "md" | "lg" | null>(null);
    return (
      <>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outlined" color="neutral" label="Small" onClick={() => setSize("sm")} />
          <Button variant="outlined" color="neutral" label="Medium" onClick={() => setSize("md")} />
          <Button variant="outlined" color="neutral" label="Large" onClick={() => setSize("lg")} />
        </div>
        {size ? (
          <Dialog
            open
            onClose={() => setSize(null)}
            size={size}
            title={`${size.toUpperCase()} 크기`}
            footer={
              <Button
                variant="outlined"
                color="neutral"
                label="닫기"
                onClick={() => setSize(null)}
              />
            }
          >
            <p className="text-body2" style={{ margin: 0 }}>
              size=&quot;{size}&quot;
            </p>
          </Dialog>
        ) : null}
      </>
    );
  },
};

/*
 * ===== 동작 보장 테스트 =====
 * 문서용 예시가 아니라, 고쳐놓은 동작이 그대로 유지되는지 자동으로 확인하는 스토리다.
 * `npm test`로 실행된다. 문서(autodocs)에는 나오지 않는다.
 */

/**
 * handleKeyDown이 `if (event.key !== "Tab") return`으로 Tab 외 모든 키를 무시해서
 * Escape로 닫을 수 없었다. role="dialog"에는 Escape 닫기가 기대 동작이다.
 */
export const ClosesOnEscape: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="다이얼로그 열기" onClick={() => setOpen(true)} />
        <Dialog {...args} open={open} onClose={() => setOpen(false)} title="Escape 확인" />
      </>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "다이얼로그 열기" }));
    // Dialog는 document.body로 포털되므로 canvas가 아니라 screen으로 조회한다.
    const dialog = await screen.findByRole("dialog");

    await userEvent.keyboard("{Escape}");
    await expect(dialog).not.toBeInTheDocument();
  },
};

/**
 * 패널 안 텍스트를 드래그로 선택하다 오버레이 위에서 마우스를 놓으면 click 이벤트는
 * 오버레이에서 발생한다. 이때 닫히면 사용자가 입력 중인 내용을 잃는다.
 * "누르기 시작한 곳"이 오버레이일 때만 닫혀야 한다.
 */
export const StaysOpenWhenDragEndsOnOverlay: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="다이얼로그 열기" onClick={() => setOpen(true)} />
        <Dialog {...args} open={open} onClose={() => setOpen(false)} title="드래그 확인">
          <p style={{ margin: 0 }}>이 문장을 드래그로 선택합니다.</p>
        </Dialog>
      </>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "다이얼로그 열기" }));
    const dialog = await screen.findByRole("dialog");
    const overlay = dialog.parentElement!;

    // 패널 안에서 누르기 시작 → 오버레이에서 click 발생 (브라우저는 공통 조상에 click을 보낸다)
    await fireEvent.pointerDown(dialog);
    await fireEvent.click(overlay);
    await expect(dialog).toBeInTheDocument();

    // 오버레이에서 누르기 시작해 그 자리에서 놓으면 닫혀야 한다.
    await fireEvent.pointerDown(overlay);
    await fireEvent.click(overlay);
    await expect(dialog).not.toBeInTheDocument();
  },
};

/**
 * 포커스 가능 요소가 0개일 때 매 Tab마다 preventDefault + panel.focus()가 실행돼
 * Tab이 영구히 삼켜졌다 (WCAG 2.1.2 키보드 트랩).
 * Tab을 가로채지 않아야 키보드만으로 빠져나갈 수 있다.
 */
export const DoesNotTrapKeyboard: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="다이얼로그 열기" onClick={() => setOpen(true)} />
        <Dialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          showCloseButton={false}
          title="포커스 가능 요소 없음"
          footer={undefined}
        >
          <p style={{ margin: 0 }}>텍스트만 있습니다.</p>
        </Dialog>
      </>
    );
  },
  play: async ({ canvas }) => {
    const opener = canvas.getByRole("button", { name: "다이얼로그 열기" });
    await userEvent.click(opener);

    // Dialog는 document.body로 포털되므로 canvas가 아니라 screen으로 조회한다.
    const dialog = await screen.findByRole("dialog");
    // 포커스 가능 요소가 없으면 패널 자체가 포커스를 받는다.
    // 초기 포커스는 requestAnimationFrame에서 일어나므로 기다린다.
    await waitFor(() => expect(dialog).toHaveFocus());

    // Tab이 삼켜지지 않아야 한다. 가로채면 포커스가 패널에 그대로 머문다.
    await userEvent.tab();
    await expect(dialog).not.toHaveFocus();

    // Escape도 여전히 동작해야 한다 — 닫기 컨트롤이 없으므로 유일한 탈출로다.
    await userEvent.keyboard("{Escape}");
    await expect(dialog).not.toBeInTheDocument();
  },
};

/**
 * FOCUSABLE 셀렉터가 input[type=hidden]을 매치하고 가시성 검사가 display:none을 놓쳐서,
 * 첫 필드가 hidden input인 폼에서 초기 포커스가 no-op이 되고 포커스가 오버레이 뒤에 남았다.
 */
export const FocusesFirstVisibleField: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="폼 열기" onClick={() => setOpen(true)} />
        <Dialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          showCloseButton={false}
          title="hidden 필드가 앞에 있는 폼"
        >
          <form onSubmit={(event) => event.preventDefault()}>
            <input type="hidden" name="csrf" />
            <div style={{ display: "none" }}>
              <input aria-label="display none 필드" />
            </div>
            <input aria-label="visibility hidden 필드" style={{ visibility: "hidden" }} />
            <input aria-label="disabled 필드" disabled />
            <input aria-label="첫 보이는 필드" />
          </form>
        </Dialog>
      </>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "폼 열기" }));
    await screen.findByRole("dialog");

    // hidden / display:none / visibility:hidden / disabled 를 모두 건너뛰어야 한다.
    // 초기 포커스는 requestAnimationFrame에서 일어나므로 기다린다.
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "첫 보이는 필드" })).toHaveFocus(),
    );
  },
};
