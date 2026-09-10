import {
  CSSProperties,
  useId,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Radio, type RadioSize } from "./Radio";
import styles from "./Radio.module.css";

export type RadioGroupDirection = "horizontal" | "vertical";

export interface RadioGroupOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  /** 옵션 그룹 라벨. 빈 값이면 숨긴다. */
  label?: ReactNode;
  /** 옵션 목록 */
  options: RadioGroupOption[];
  /** 옵션 그룹 정렬 방향 */
  direction?: RadioGroupDirection;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** true면 하위 모든 옵션을 비활성화한다. */
  disabled?: boolean;
  size?: RadioSize;
  /** 폼 제출 시 각 Radio에 공유되는 name. 없으면 자동 생성한다. */
  name?: string;
  /** 각 옵션 간의 간격 커스텀이 필요할 때 사용. 기본값 12 */
  optionGap?: number;

  /** 옵션 그룹 전체에 스타일을 추가할 때 쓴다. */
  style?: CSSProperties;
  className?: string;
}

export function RadioGroup({
  label,
  options,
  direction = "vertical",
  value,
  defaultValue,
  onChange,
  disabled = false,
  size = "md",
  name,
  optionGap = 12,
  id,
  className,
  style,
  ...rest
}: RadioGroupProps) {
  const generatedId = useId();
  const groupId = id ?? generatedId;
  const labelId = label ? `${groupId}-label` : undefined;
  const groupName = name ?? `${groupId}-radio`;

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = isControlled ? value : uncontrolledValue;

  const handleChange = (optionValue: string) => (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledValue(optionValue);
    onChange?.(optionValue, event);
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
      role="radiogroup"
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
          <Radio
            key={opt.value}
            name={groupName}
            value={opt.value}
            label={opt.label}
            size={size}
            disabled={disabled || opt.disabled}
            checked={currentValue === opt.value}
            onChange={handleChange(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}
