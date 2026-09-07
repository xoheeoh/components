import type { Meta, StoryObj } from "@storybook/react-vite";
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
