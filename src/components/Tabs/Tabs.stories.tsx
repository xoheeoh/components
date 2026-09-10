import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { Tabs, TabList, Tab, TabPanel } from "./Tabs";

const DEFAULT_TABS = [
  { value: "tab1", label: "탭 1", panel: "첫 번째 탭 내용입니다." },
  { value: "tab2", label: "탭 2", panel: "두 번째 탭 내용입니다." },
  { value: "tab3", label: "탭 3", panel: "세 번째 탭 내용입니다." },
];

const MANY_TABS = [
  { value: "overview", label: "개요" },
  { value: "orders", label: "주문 내역" },
  { value: "shipping", label: "배송 조회" },
  { value: "coupons", label: "쿠폰함" },
  { value: "points", label: "포인트" },
  { value: "reviews", label: "리뷰" },
  { value: "inquiries", label: "문의" },
  { value: "settings", label: "설정" },
  { value: "alerts", label: "알림" },
  { value: "membership", label: "멤버십" },
];

const meta = {
  title: "Components/Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  args: {
    resize: "hug",
    size: "md",
    defaultValue: "tab1",
  },
  argTypes: {
    resize: { control: "inline-radio", options: ["hug", "fill"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    onChange: { table: { disable: true } },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
  },
  render: (args) => (
    <Tabs {...args} style={{ width: 400 }}>
      <TabList aria-label="예시 탭">
        {DEFAULT_TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
      {DEFAULT_TABS.map((tab) => (
        <TabPanel key={tab.value} value={tab.value}>
          <div className="text-body2" style={{ paddingTop: 16 }}>
            {tab.panel}
          </div>
        </TabPanel>
      ))}
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** hug에서 탭이 목록보다 넓으면 가로 스크롤이 생깁니다. */
export const Scroll: Story = {
  args: {
    resize: "hug",
    defaultValue: "overview",
  },
  render: (args) => (
    <Tabs {...args} style={{ width: 400 }}>
      <TabList aria-label="탭이 많은 예시">
        {MANY_TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
      {MANY_TABS.map((tab) => (
        <TabPanel key={tab.value} value={tab.value}>
          <div className="text-body2" style={{ paddingTop: 16 }}>
            {tab.label} 내용입니다. 목록을 가로로 스크롤해 나머지 탭을 볼 수 있습니다.
          </div>
        </TabPanel>
      ))}
    </Tabs>
  ),
};

/** disabled 탭은 클릭해도 선택되지 않습니다. */
export const Disabled: Story = {
  render: (args) => (
    <Tabs {...args} style={{ width: 400 }}>
      <TabList aria-label="비활성 탭 예시">
        <Tab value="tab1">탭 1</Tab>
        <Tab value="tab2" disabled>
          탭 2
        </Tab>
        <Tab value="tab3">탭 3</Tab>
      </TabList>
      <TabPanel value="tab1">
        <div className="text-body2" style={{ paddingTop: 16 }}>
          첫 번째 탭 내용입니다.
        </div>
      </TabPanel>
      <TabPanel value="tab2"></TabPanel>
      <TabPanel value="tab3">
        <div className="text-body2" style={{ paddingTop: 16 }}>
          세 번째 탭 내용입니다.
        </div>
      </TabPanel>
    </Tabs>
  ),
};

/**
 * 탭 목록은 Tab 키 정지점이 하나이고, 안에서는 ←→ / Home / End로 이동하며
 * 이동한 탭이 바로 선택된다 (APG tabs 패턴). 양끝에서는 반대편으로 순환한다.
 */
export const KeyboardNavigation: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  play: async ({ canvas }) => {
    const [tab1, tab2, tab3] = canvas.getAllByRole("tab");

    // 선택된 탭만 Tab 키로 도달할 수 있다
    await expect(tab1).toHaveAttribute("tabindex", "0");
    await expect(tab2).toHaveAttribute("tabindex", "-1");
    await expect(tab3).toHaveAttribute("tabindex", "-1");

    await userEvent.click(tab1);
    await userEvent.keyboard("{ArrowRight}");
    await expect(tab2).toHaveFocus();
    await expect(tab2).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("두 번째");

    await userEvent.keyboard("{End}");
    await expect(tab3).toHaveFocus();
    await expect(tab3).toHaveAttribute("aria-selected", "true");

    // 마지막에서 → 는 첫 번째로 순환
    await userEvent.keyboard("{ArrowRight}");
    await expect(tab1).toHaveFocus();

    await userEvent.keyboard("{ArrowLeft}");
    await expect(tab3).toHaveFocus();

    await userEvent.keyboard("{Home}");
    await expect(tab1).toHaveFocus();

    // Tab 키는 목록을 빠져나간다 — 다른 탭에 멈추지 않는다
    await userEvent.tab();
    await expect(tab1).not.toHaveFocus();
    await expect(tab2).not.toHaveFocus();
    await expect(tab3).not.toHaveFocus();
  },
};

/** 화살표 이동은 disabled 탭을 건너뛴다. */
export const KeyboardSkipsDisabled: Story = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true } },
  render: Disabled.render,
  play: async ({ canvas }) => {
    const [tab1, , tab3] = canvas.getAllByRole("tab");

    await userEvent.click(tab1);
    await userEvent.keyboard("{ArrowRight}");
    await expect(tab3).toHaveFocus();
    await expect(tab3).toHaveAttribute("aria-selected", "true");
  },
};
