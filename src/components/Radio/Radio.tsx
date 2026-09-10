import {
  ChangeEvent,
  CSSProperties,
  forwardRef,
  InputHTMLAttributes,
  useId,
  useState,
  type ReactNode,
} from "react";
import styles from "./Radio.module.css";

export type RadioSize = "sm" | "md";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** 옵션 라벨. 빈 값인 경우 숨김 처리. */
  label?: ReactNode;
  size?: RadioSize;

  /** 라벨 color, fontWeight 등의 변경이 필요한 경우 */
  labelStyle?: CSSProperties;
  labelClassName?: string;

  /** 라디오 + 라벨 전체 스타일 변경이 필요한 경우 */
  style?: CSSProperties;
  className?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    label,
    size = "md",
    id,
    disabled = false,
    checked,
    defaultChecked,
    onChange,
    labelClassName,
    labelStyle,
    style,
    className,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const isControlled = checked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(Boolean(defaultChecked));
  const isChecked = isControlled ? Boolean(checked) : uncontrolledChecked;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledChecked(e.target.checked);
    onChange?.(e);
  };

  const visualState = isChecked ? "checked" : "unchecked";
  const rootClass = [styles.root, styles[size], disabled ? styles.disabled : "", className]
    .filter(Boolean)
    .join(" ");
  const labelClass = [styles.label, labelClassName].filter(Boolean).join(" ");

  return (
    <label className={rootClass} htmlFor={inputId} style={style}>
      <input
        {...rest}
        id={inputId}
        type="radio"
        className={styles.input}
        ref={ref}
        disabled={disabled}
        checked={isChecked}
        onChange={handleChange}
      />
      <span className={styles.radio} data-state={visualState} aria-hidden />
      {label && (
        <span className={labelClass} style={labelStyle}>
          {label}
        </span>
      )}
    </label>
  );
});
