import {
  forwardRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import styles from "./Switch.module.css";

export type SwitchSize = "sm" | "md";

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "type"
> {
  /** 옵션 라벨. 빈 값이면 숨긴다. */
  label?: ReactNode;
  size?: SwitchSize;
  /** 제어 모드 선택 여부 */
  checked?: boolean;
  /** 비제어 모드 초기 선택 여부 */
  defaultChecked?: boolean;
  /** 선택이 바뀌면 다음 checked 값을 전달한다. */
  onChange?: (checked: boolean, event: MouseEvent<HTMLButtonElement>) => void;

  /** 라벨 color, fontWeight 등을 바꿀 때 쓴다. */
  labelStyle?: CSSProperties;
  labelClassName?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    label,
    size = "sm",
    id,
    disabled = false,
    checked,
    defaultChecked,
    onChange,
    onClick,
    labelClassName,
    labelStyle,
    style,
    className,
    ...rest
  },
  ref,
) {
  const isControlled = checked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(Boolean(defaultChecked));
  const isChecked = isControlled ? Boolean(checked) : uncontrolledChecked;
  const visualState = isChecked ? "checked" : "unchecked";

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) setUncontrolledChecked(next);
    onChange?.(next, event);
    onClick?.(event);
  };

  const rootClass = [styles.root, styles[size], disabled ? styles.disabled : "", className]
    .filter(Boolean)
    .join(" ");
  const labelClass = [styles.label, labelClassName].filter(Boolean).join(" ");

  return (
    <button
      {...rest}
      ref={ref}
      id={id}
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      className={rootClass}
      style={style}
      onClick={handleClick}
    >
      <span className={styles.track} data-state={visualState} aria-hidden>
        <span className={styles.thumb} />
      </span>
      {label && (
        <span className={labelClass} style={labelStyle}>
          {label}
        </span>
      )}
    </button>
  );
});
