import type { CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { mdiDotsHorizontal, mdiMagnify, mdiPlus } from "@mdi/js";
import {
  Banner,
  Button,
  Calendar,
  Checkbox,
  Icon,
  IconButton,
  Pagination,
  RadioGroup,
  SegmentedControl,
  Select,
  Spinner,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TextButton,
  TextInput,
} from "./components";

// 여러 컴포넌트를 한 화면에 모아 보여 주는 대표 화면이다.
// README의 미리보기 이미지(docs/preview.png)는 이 스토리를 찍은 것이다.
// 컴포넌트 모양을 바꾸면 `npm run preview:capture`로 이미지를 다시 만든다.
const meta = {
  title: "Overview",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const pageStyle: CSSProperties = {
  width: 1200,
  boxSizing: "border-box",
  padding: 32,
  display: "grid",
  gridTemplateColumns: "1fr 1fr 332px",
  gap: 20,
};

const cardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 24,
  border: "1px solid var(--semantic-neutral-border)",
  borderRadius: "var(--r-lg)",
  background: "var(--semantic-neutral-bg)",
};

const columnStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 20 };
const rowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" };

// 카드 하나 — 위에 작은 제목, 아래에 컴포넌트를 놓는다.
// grow를 주면 남는 세로 공간을 채워서 세 열의 아래쪽 끝이 맞는다.
function Card({ title, grow, children }: { title: string; grow?: boolean; children: ReactNode }) {
  return (
    <section style={grow ? { ...cardStyle, flex: 1 } : cardStyle}>
      <h2
        className="text-caption1"
        style={{ margin: 0, color: "var(--semantic-label-alternative)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export const Preview: Story = {
  render: () => (
    <div style={pageStyle}>
      <div style={columnStyle}>
        <Card title="Button">
          <div style={rowStyle}>
            <Button label="저장" />
            <Button label="취소" variant="outlined" color="neutral" />
            <Button label="삭제" color="destructive" />
          </div>
          <div style={rowStyle}>
            <Button label="추가" variant="outlined" icon={<Icon path={mdiPlus} size={20} />} />
            <TextButton label="더보기" />
            <IconButton icon={<Icon path={mdiMagnify} />} aria-label="검색" variant="outlined" />
            <IconButton icon={<Icon path={mdiDotsHorizontal} />} aria-label="메뉴 열기" />
            <Spinner size="sm" label="불러오는 중" />
          </div>
        </Card>

        <Card title="TextInput · Select" grow>
          <TextInput label="이메일" defaultValue="hello@example.com" status="positive" />
          <TextInput
            label="비밀번호"
            type="password"
            defaultValue="1234"
            status="negative"
            description="8자 이상 입력해 주세요."
          />
          <Select
            label="팀"
            defaultValue="design"
            options={[
              { value: "design", label: "Design" },
              { value: "eng", label: "Engineering" },
              { value: "product", label: "Product" },
            ]}
          />
        </Card>
      </div>

      <div style={columnStyle}>
        <Card title="Banner">
          <Banner type="success" message="변경 사항이 저장되었습니다." />
          <Banner type="info" message="새로운 업데이트가 있습니다." />
          <Banner type="warning" message="저장 공간이 얼마 남지 않았습니다." />
        </Card>

        <Card title="Tabs · SegmentedControl · Pagination" grow>
          <Tabs resize="hug" defaultValue="all">
            <TabList aria-label="문서 분류">
              <Tab value="all">전체</Tab>
              <Tab value="mine">내 문서</Tab>
              <Tab value="shared">공유됨</Tab>
            </TabList>
            <TabPanel value="all" />
            <TabPanel value="mine" />
            <TabPanel value="shared" />
          </Tabs>
          <SegmentedControl
            aria-label="기간 단위"
            defaultValue="week"
            options={[
              { value: "day", label: "일" },
              { value: "week", label: "주" },
              { value: "month", label: "월" },
            ]}
          />
          <Pagination type="number" count={12} defaultPage={3} aria-label="페이지" />
        </Card>
      </div>

      <div style={columnStyle}>
        <Card title="Calendar">
          {/* 날짜를 고정해 두어야 언제 찍어도 같은 이미지가 나온다. */}
          <Calendar
            mode="date"
            today={new Date(2026, 10, 24)}
            selected={new Date(2026, 10, 18)}
            defaultMonth={new Date(2026, 10, 1)}
          />
        </Card>

        <Card title="Checkbox · Radio · Switch" grow>
          <div style={{ ...rowStyle, gap: 20 }}>
            <Checkbox label="메일 알림" defaultChecked />
            <Checkbox label="푸시 알림" />
          </div>
          <RadioGroup
            aria-label="요금제"
            name="overview-plan"
            direction="horizontal"
            defaultValue="pro"
            options={[
              { value: "free", label: "Free" },
              { value: "pro", label: "Pro" },
              { value: "team", label: "Team" },
            ]}
          />
          <div style={{ ...rowStyle, gap: 20 }}>
            <Switch label="공개" defaultChecked />
            <Switch label="댓글 허용" />
          </div>
        </Card>
      </div>
    </div>
  ),
};
