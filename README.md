# @xoheeoh/components

React + TypeScript UI 컴포넌트 라이브러리입니다. 스타일은 CSS Modules와 디자인 토큰(`--semantic-*`, `--text-*` 등)으로 구성됩니다.

Peer: `react`, `react-dom` (^18).

## Install

```bash
npm install @xoheeoh/components
```

## 시작하기

컴포넌트와 함께 **토큰·유틸 스타일**을 반드시 불러옵니다. 패키지 JS는 CSS를 자동 주입하지 않으므로 `styles.css` import가 필요합니다.

```tsx
import { Button } from "@xoheeoh/components";
import "@xoheeoh/components/styles.css";

export function Example() {
  return <Button label="저장" onClick={() => {}} />;
}
```

`styles.css`에 포함되는 것:

- 색 (`--atomic-*`, `--semantic-*`)
- 타이포 (`--text-*`, `.text-body2` 같은 유틸 클래스)
- 라운드·모션 (`--r-*`, `--press-scale`)
- 그림자 (`--shadow-*`)

컴포넌트는 `html`/`body` 글꼴을 덮어쓰지 않습니다. `button`/`input`/`select`/`textarea`는 `font-family: inherit`이라 **소비 앱의 글꼴이 그대로 적용**됩니다.

## 글꼴

앱에 이미 글꼴이 있으면 추가 설정은 필요 없습니다.

```css
/* 소비 앱 */
body {
  font-family: "Noto Sans KR", sans-serif;
}
```

이 라이브러리와 같이 Pretendard를 쓰려면 `styles.css` **다음**에 `fonts.css`를 넣습니다. `@font-face`와 `html, body { font-family: var(--font-sans); }`가 들어 있습니다.

```tsx
import "@xoheeoh/components/styles.css";
import "@xoheeoh/components/fonts.css";
```

`--font-sans` 토큰은 `styles.css`에도 정의되어 있습니다. 앱 일부만 이 스택을 쓰려면 해당 영역에 `font-family: var(--font-sans)`를 지정하면 됩니다.

## 테마

컴포넌트 CSS는 hex를 직접 쓰지 않고 **semantic 토큰**만 참조합니다. `styles.css`보다 **뒤에** 변수를 덮어쓰면 브랜드 색을 바꿀 수 있습니다.

```tsx
import { Button } from "@xoheeoh/components";
import "@xoheeoh/components/styles.css";
import "./theme.css";
```

```css
/* theme.css */
:root {
  --atomic-blue-500: #6366f1;
  --semantic-primary-fg: var(--atomic-blue-500);
  --semantic-primary-bg: var(--atomic-blue-50);
  --semantic-primary-border: var(--atomic-blue-200);
  --semantic-primary-hover-bg: var(--atomic-blue-100);
  --semantic-primary-hover-fg: var(--atomic-blue-600);
  --semantic-primary-hover-border: var(--atomic-blue-300);
}
```

특정 영역만 바꾸려면 래퍼에 같은 변수를 지정합니다.

```css
.theme-alt {
  --semantic-primary-fg: #0f766e;
}
```

### Semantic 토큰

| 그룹 | 토큰 | 용도 |
| --- | --- | --- |
| Static | `--semantic-static-white`, `--semantic-static-black` | 고정 흰/검 |
| Dimmer | `--semantic-dimmer` | 모달 오버레이 |
| Primary | `--semantic-primary-bg/fg/border` + `hover-*` | 강조, 포커스 |
| Neutral | `--semantic-neutral-bg/fg/border` + `hover-*` | 기본 면·선 |
| Error | `--semantic-error-bg/fg/border` + `hover-*` | 위험, destructive |
| Positive | `--semantic-positive-bg/fg/border` | 성공 |
| Info | `--semantic-info-bg/fg/border` | 안내 |
| Warning | `--semantic-warning-bg/fg/border` | 경고 |
| Disabled | `--semantic-disabled-bg/fg/border`, `--semantic-disabled-fg-assistive` | 비활성 |
| Label | `--semantic-label-normal/alternative/assistive` | 본문·보조 텍스트 |

atomic 스케일(`--atomic-blue-50` … `--atomic-blue-900` 등)을 바꾸면 그걸 가리키는 semantic 값도 따라갑니다. 컴포넌트에서는 atomic을 직접 쓰지 않는 것을 권장합니다.

### 그 외 토큰

| 종류 | 예시 |
| --- | --- |
| Radius | `--r-xs` `4px` … `--r-full` |
| Motion | `--press-scale` `0.97` |
| Shadow | `--shadow-normal-xs` … `--shadow-normal-xl`, `--shadow-spread-sm/md` |

## 타이포그래피

역할별 크기·두께는 CSS 변수와 유틸 클래스가 같습니다.

```tsx
<p className="text-subtitle1">제목</p>
<p className="text-body2">본문</p>
<p className="text-caption1">보조</p>
```

| 클래스 | 용도 |
| --- | --- |
| `text-heading1` … `text-heading3` | 제목 |
| `text-subtitle1` … `text-subtitle4` | 소제목 |
| `text-body1`, `text-body2` | 본문 |
| `text-caption1`, `text-caption2` | 캡션 |

각 역할은 `--text-{role}-size|weight|letter-spacing|line-height`로도 참조할 수 있습니다.

## 컴포넌트

자세한 props는 패키지 타입과 Storybook을 보면 됩니다. 자주 쓰는 패턴만 적습니다.

### Button / TextButton / IconButton

```tsx
import { Button, TextButton, IconButton, Icon } from "@xoheeoh/components";
import { mdiPlus } from "@mdi/js";

<Button label="저장" variant="solid" color="primary" size="md" />
<Button label="삭제" color="destructive" loading />
<TextButton label="더보기" color="neutral" />
<IconButton icon={<Icon path={mdiPlus} />} aria-label="추가" />
```

- `Button`: `variant` `solid` \| `outlined`, `color` `primary` \| `neutral` \| `destructive`, `size` `sm` \| `md` \| `lg`
- `icon` + `iconOnly`로 아이콘 전용 버튼

### TextInput / Textarea / Select

```tsx
<TextInput label="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
<Textarea label="메모" status="negative" description="필수 항목입니다." />
<Select
  label="팀"
  options={[
    { value: "design", label: "Design" },
    { value: "eng", label: "Eng" },
  ]}
  value={team}
  onValueChange={setTeam}
/>
```

`status`: `default` \| `positive` \| `negative`. Select는 `multiple`이면 값이 `string[]`입니다.

### Checkbox / Radio / Switch / SegmentedControl

```tsx
<Checkbox label="동의" checked={ok} onChange={(e) => setOk(e.target.checked)} />
<CheckboxGroup
  label="알림"
  options={[
    { value: "mail", label: "메일" },
    { value: "push", label: "푸시" },
  ]}
  value={noti}
  onChange={setNoti}
/>
<RadioGroup
  name="plan"
  options={[
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro" },
  ]}
  value={plan}
  onChange={setPlan}
/>
<Switch label="공개" checked={on} onChange={setOn} />
<SegmentedControl
  options={[
    { value: "day", label: "일" },
    { value: "week", label: "주" },
  ]}
  value={unit}
  onChange={setUnit}
/>
```

### DateField / Calendar

값은 문자열입니다. 일 단위 `YYYY-MM-DD`, 월 단위 `YYYY-MM`.

```tsx
<DateField mode="single" label="시작일" value={date} onValueChange={setDate} />
<DateField
  mode="range"
  granularity="date"
  from={from}
  to={to}
  onFromChange={setFrom}
  onToChange={setTo}
  showShortcuts
/>
<Calendar mode="date" selected={selected} onSelect={setSelected} />
```

range 숏컷 기본값은 `DEFAULT_DAY_SHORTCUTS` / `DEFAULT_MONTH_SHORTCUTS`로 export되어 있습니다.

### Dialog / Alert / Banner / Toast

```tsx
<Dialog open={open} onClose={() => setOpen(false)} title="확인" footer={<Button label="닫기" onClick={() => setOpen(false)} />}>
  본문
</Dialog>

<Alert
  open={open}
  onClose={() => setOpen(false)}
  title="삭제할까요?"
  message="되돌릴 수 없습니다."
  secondaryAction={{ label: "취소" }}
  destructiveAction={{ label: "삭제", onClick: onDelete }}
/>

<Banner type="info" message="새로운 업데이트가 있습니다." />
```

Toast는 앱 루트를 `ToastProvider`로 감싼 뒤 `useToast`로 띄웁니다.

```tsx
import { ToastProvider, useToast } from "@xoheeoh/components";

function App() {
  return (
    <ToastProvider>
      <Page />
    </ToastProvider>
  );
}

function Page() {
  const toast = useToast();
  return <Button label="완료" onClick={() => toast.success("저장되었습니다.")} />;
}
```

`toast(message)`, `toast.success/info/warning/error`, `toast.dismiss(id?)`.

### Tabs / Pagination / Tooltip / Spinner / Icon

```tsx
<Tabs resize="hug" value={tab} onChange={setTab}>
  <TabList>
    <Tab value="a">A</Tab>
    <Tab value="b">B</Tab>
  </TabList>
  <TabPanel value="a">A 패널</TabPanel>
  <TabPanel value="b">B 패널</TabPanel>
</Tabs>

<Pagination type="number" count={12} page={page} onChange={setPage} />

<Tooltip content="도움말" position="top" arrow="vertical">
  <button type="button">?</button>
</Tooltip>

<Spinner size="md" label="로딩 중" />

<Icon path={mdiHome} size={24} />
```

`Icon`의 `path`는 [`@mdi/js`](https://pictogrammers.com/library/mdi/) 상수를 넣습니다.

```tsx
import { mdiHome } from "@mdi/js";
```

## Export 목록

`Button`, `TextButton`, `IconButton`, `TextInput`, `Textarea`, `Select`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `SegmentedControl`, `DateField`, `Calendar`, `Dialog`, `Alert`, `Banner`, `Toast`, `ToastProvider`, `useToast`, `Tabs`, `TabList`, `Tab`, `TabPanel`, `Pagination`, `Tooltip`, `Spinner`, `Icon`

타입과 DateField 숏컷 헬퍼(`DEFAULT_DAY_SHORTCUTS` 등)도 같은 엔트리에서 export됩니다.

## 로컬 미리보기

이 저장소에서 컴포넌트를 보려면:

```bash
npm install
npm run storybook   # http://localhost:6006
```
