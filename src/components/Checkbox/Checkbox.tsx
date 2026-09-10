import {
  ChangeEvent,
  CSSProperties,
  forwardRef,
  InputHTMLAttributes,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./Checkbox.module.css";
import { Icon } from "../Icon";
import { mdiCheck, mdiMinus } from "@mdi/js";

export type CheckboxSize = "sm" | "md";

const ICON_SIZE: Record<CheckboxSize, number> = {
  sm: 12,
  md: 14,
};

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  /** 옵션 라벨. 빈 값이면 숨긴다. */
  label?: ReactNode;
  size?: CheckboxSize;
  /** 체크박스 상태가 부분적으로 체크된 상태인지 여부 */
  indeterminate?: boolean;

  /** 라벨 color, fontWeight 등을 바꿀 때 쓴다. */
  labelStyle?: CSSProperties;
  labelClassName?: string;

  /** 체크박스 + 라벨 전체 스타일을 바꿀 때 쓴다. */
  style?: CSSProperties;
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    size = "md",
    id,
    disabled = false,
    checked,
    defaultChecked,
    indeterminate = false,
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

  // input과 체크 상태 연결
  const isControlled = checked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(Boolean(defaultChecked));
  const isChecked = isControlled ? Boolean(checked) : uncontrolledChecked;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledChecked(e.target.checked);
    onChange?.(e);
  };

  // 체크박스 변경
  const visualState = indeterminate ? "indeterminate" : isChecked ? "checked" : "unchecked";

  const rootClass = [styles.root, styles[size], disabled ? styles.disabled : "", className]
    .filter(Boolean)
    .join(" ");
  const labelClass = [styles.label, labelClassName].filter(Boolean).join(" ");

  const innerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const node = innerRef.current;
    if (!node) return;
    node.indeterminate = Boolean(indeterminate);
  }, [indeterminate, isChecked]);

  useEffect(() => {
    if (typeof ref === "function") {
      ref(innerRef.current);
      return () => ref(null);
    }
    if (ref) ref.current = innerRef.current;
  }, [ref]);

  return (
    <label className={rootClass} htmlFor={inputId} style={style}>
      <input
        {...rest}
        id={inputId}
        type="checkbox"
        className={styles.input}
        ref={innerRef}
        disabled={disabled}
        checked={isChecked}
        onChange={handleChange}
      />
      <span className={styles.checkbox} data-state={visualState} aria-hidden>
        <Icon path={visualState === "indeterminate" ? mdiMinus : mdiCheck} size={ICON_SIZE[size]} />
      </span>
      {label && (
        <span className={labelClass} style={labelStyle}>
          {label}
        </span>
      )}
    </label>
  );
});
