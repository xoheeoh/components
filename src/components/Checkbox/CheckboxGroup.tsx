import {
  CSSProperties,
  useId,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Checkbox, type CheckboxSize } from "./Checkbox";
import styles from "./Checkbox.module.css";

export type CheckboxGroupDirection = "horizontal" | "vertical";

export interface CheckboxGroupOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface CheckboxGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  /** 옵션 그룹 라벨. 빈 값인 경우 숨김 처리 */
  label?: ReactNode;
  /** 옵션 목록 */
  options: CheckboxGroupOption[];
  /** 옵션 그룹 정렬 방향 */
  direction?: CheckboxGroupDirection;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[], event: ChangeEvent<HTMLInputElement>) => void;
  /** true일 경우 하위 모든 옵션 비활성화 처리 */
  disabled?: boolean;
  size?: CheckboxSize;
  /** 폼 제출 시 각 Checkbox에 공유되는 name */
  name?: string;
  /** 각 옵션 간의 간격 커스텀이 필요할 때 사용. 기본값 12 */
  optionGap?: number;

  /** 옵션 그룹 전체에 스타일 추가가 필요한 경우 */
  style?: CSSProperties;
  className?: string;
}

export function CheckboxGroup({
  label,
  options,
  direction = "vertical",
  value,
  defaultValue = [],
  onChange,
  disabled = false,
  size = "md",
  name,
  optionGap = 12,
  id,
  className,
  style,
  ...rest
}: CheckboxGroupProps) {
  const generatedId = useId();
  const groupId = id ?? generatedId;
  const labelId = label ? `${groupId}-label` : undefined;

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = isControlled ? value : uncontrolledValue;

  const handleChange = (optionValue: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.checked
      ? currentValue.includes(optionValue)
        ? currentValue
        : [...currentValue, optionValue]
      : currentValue.filter((v) => v !== optionValue);
    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next, event);
  };

  const rootClass = [styles.group, className].filter(Boolean).join(" ");
  const groupLabelClass = [styles.groupLabel, styles[size]].filter(Boolean).join(" ");
  const groupOptionsClass = [styles.groupOption, styles[direction]].filter(Boolean).join(" ");

  return (
    <div
      {...rest}
      id={groupId}
      className={rootClass}
      style={style}
      role="group"
      aria-labelledby={labelId}
      aria-disabled={disabled || undefined}
    >
      {label && (
        <span id={labelId} className={groupLabelClass}>
          {label}
        </span>
      )}

      <div className={groupOptionsClass} style={{ gap: optionGap }}>
        {options.map((opt) => (
          <Checkbox
            key={opt.value}
            name={name}
            value={opt.value}
            label={opt.label}
            size={size}
            disabled={disabled || opt.disabled}
            checked={currentValue.includes(opt.value)}
            onChange={handleChange(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}
