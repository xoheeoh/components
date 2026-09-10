import {
  useId,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { findNextByArrowKey } from "../../utils";
import styles from "./SegmentedControl.module.css";

const ENABLED_RADIO_SELECTOR = '[role="radio"]:not([disabled])';

export type SegmentedControlSize = "sm" | "md" | "lg";
export type SegmentedControlType = "solid" | "outlined";

export interface SegmentedControlOption {
  value: string;
  label: ReactNode;
  /** 라벨 옆 아이콘 */
  icon?: ReactNode;
  /** 아이콘 위치. 기본값 left */
  iconPosition?: "left" | "right";
}

export interface SegmentedControlProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  type?: SegmentedControlType;
  /** 그룹 라벨. 빈 값이면 숨긴다. */
  label?: ReactNode;
  /** 세그먼트 목록 */
  options: SegmentedControlOption[];
  /** 제어 모드 선택값 */
  value?: string;
  /** 비제어 모드 초기 선택값 */
  defaultValue?: string;
  onChange?: (value: string, event: MouseEvent<HTMLButtonElement>) => void;
  size?: SegmentedControlSize;
  /** true면 컨테이너 너비에 맞춰 세그먼트를 균등 분배한다. */
  fullWidth?: boolean;
}

export function SegmentedControl({
  type = "solid",
  label,
  options,
  value,
  defaultValue,
  onChange,
  size = "md",
  fullWidth = false,
  id,
  className,
  style,
  ...rest
}: SegmentedControlProps) {
  const generatedId = useId();
  const groupId = id ?? generatedId;
  const labelId = label ? `${groupId}-label` : undefined;

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = isControlled ? value : uncontrolledValue;

  const handleSelect = (optionValue: string) => (event: MouseEvent<HTMLButtonElement>) => {
    if (currentValue === optionValue) return;
    if (!isControlled) setUncontrolledValue(optionValue);
    onChange?.(optionValue, event);
  };

  /**
   * 화살표 / Home / End로 세그먼트를 이동하면서 바로 선택한다 (네이티브 라디오 그룹과 같은 동작).
   * 선택은 click()으로 처리해 마우스와 같은 경로(handleSelect)를 탄다.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const radios = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(ENABLED_RADIO_SELECTOR),
    );
    const next = findNextByArrowKey(radios, document.activeElement, event.key, "both");
    if (!next) return;

    event.preventDefault();
    next.focus();
    next.click();
  };

  // 라디오 그룹의 Tab 키 정지점은 하나다 — 선택된 세그먼트, 없으면 첫 번째.
  const hasSelection = options.some((opt) => opt.value === currentValue);

  const rootClass = [
    styles.root,
    styles[type],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div {...rest} id={groupId} className={rootClass} style={style}>
      {label && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}

      <div
        className={styles.control}
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={handleKeyDown}
      >
        {options.map((opt, index) => {
          const selected = currentValue === opt.value;
          const tabIndex = selected || (!hasSelection && index === 0) ? 0 : -1;

          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              className={styles.segment}
              aria-checked={selected}
              tabIndex={tabIndex}
              onClick={handleSelect(opt.value)}
            >
              {opt.icon && opt.iconPosition !== "right" && (
                <span className={styles.segmentIcon} aria-hidden>
                  {opt.icon}
                </span>
              )}
              {opt.label}
              {opt.icon && opt.iconPosition === "right" && (
                <span className={styles.segmentIcon} aria-hidden>
                  {opt.icon}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
