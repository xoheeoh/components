import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./Tabs.module.css";

export type TabsResize = "hug" | "fill";
export type TabsSize = "sm" | "md" | "lg";

export interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
  size: TabsSize;
  resize: TabsResize;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`${component}는 반드시 <Tabs> 안에서 사용해야 합니다.`);
  }
  return ctx;
}

export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  /** hug는 라벨 너비, fill은 목록을 탭 개수만큼 균등 분할 */
  resize: TabsResize;
  /** 탭 버튼 크기. 기본값 md */
  size?: TabsSize;
  /** 제어 모드 선택값. 상태를 부모가 관리할 때 사용 */
  value?: string;
  /** 비제어 모드 초기 선택값. value/onChange를 안 쓸 때만 사용 */
  defaultValue?: string;
  /** 탭 변경 시 새 value 전달. 예) onChange={setTab} */
  onChange?: (value: string) => void;
  children?: ReactNode;
}

/** 클릭/선택으로 목적에 따라 구분된 콘텐츠를 보여 주는 탭 */
export function Tabs({
  resize,
  size = "md",
  value,
  defaultValue = "",
  onChange,
  className,
  children,
  id,
  ...rest
}: TabsProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = isControlled ? value : uncontrolledValue;

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const ctx = useMemo(
    () => ({ value: currentValue, setValue, baseId, size, resize }),
    [currentValue, setValue, baseId, size, resize],
  );
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <TabsContext.Provider value={ctx}>
      <div id={baseId} className={rootClass} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** 스크린리더용 탭 목록 이름. 예) aria-label="메뉴 탭" */
  "aria-label"?: string;
}

export function TabList({ className, children, ...rest }: TabListProps) {
  const { resize } = useTabsContext("TabList");
  const listClass = [styles.list, styles[resize], className].filter(Boolean).join(" ");

  return (
    <div role="tablist" className={listClass} {...rest}>
      {children}
    </div>
  );
}

export interface TabProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "onClick"
> {
  /** 탭 식별값. 같은 value의 TabPanel과 짝을 이룸 */
  value: string;
  children?: ReactNode;
}

export function Tab({ value, disabled, className, children, ...rest }: TabProps) {
  const { value: selected, setValue, baseId, size } = useTabsContext("Tab");
  const isSelected = selected === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;
  const tabClass = [styles.tab, styles[size], className].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      className={tabClass}
      aria-selected={isSelected}
      aria-controls={panelId}
      disabled={disabled}
      onClick={() => {
        if (!disabled) setValue(value);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** 대응되는 Tab의 value와 동일해야 함 */
  value: string;
  /** true면 숨긴 패널도 DOM에 유지. 기본값 false */
  forceMount?: boolean;
  children?: ReactNode;
}

export function TabPanel({
  value,
  forceMount = false,
  className,
  children,
  ...rest
}: TabPanelProps) {
  const { value: selected, baseId } = useTabsContext("TabPanel");
  const isSelected = selected === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  if (!forceMount && !isSelected) return null;

  const panelClass = [!isSelected && forceMount ? styles.panelHidden : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="tabpanel"
      id={panelId}
      className={panelClass}
      aria-labelledby={tabId}
      hidden={!isSelected}
      {...rest}
    >
      {children}
    </div>
  );
}
