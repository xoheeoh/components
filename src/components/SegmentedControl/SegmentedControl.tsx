import { useId, useState, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import styles from "./SegmentedControl.module.css";

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
  /** 그룹 라벨. 빈 값인 경우 숨김 처리 */
  label?: ReactNode;
  /** 세그먼트 목록 */
  options: SegmentedControlOption[];
  /** 제어 모드 선택값 */
  value?: string;
  /** 비제어 모드 초기 선택값 */
  defaultValue?: string;
  onChange?: (value: string, event: MouseEvent<HTMLButtonElement>) => void;
  size?: SegmentedControlSize;
  /** true면 컨테이너 너비에 맞춰 세그먼트가 균등 분배 */
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

      <div className={styles.control} role="radiogroup" aria-labelledby={labelId}>
        {options.map((opt) => {
          const selected = currentValue === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              className={styles.segment}
              aria-checked={selected}
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
