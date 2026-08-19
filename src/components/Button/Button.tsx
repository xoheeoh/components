import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from "react";
import styles from "./Button.module.css";

export type ButtonVariant =
  | "primary"
  | "primary-soft"
  | "secondary"
  | "outline"
  | "text"
  | "destructive"
  | "destructive-soft"
  | "excel"
  | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** size=icon은 icon 단독으로 쓰이는 경우(정사각형) */
  size?: ButtonSize;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  /** inline style. 예: `{ minWidth: 100 }` */
  style?: CSSProperties;
}

/** 공용 버튼 컴포넌트 — Input, Select와 size(height) 동일하게 가져감 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", type = "button", onClick, disabled, className, style, children, ...rest },
  ref
) {
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ");

  return (
    <button ref={ref} type={type} className={classes} style={style} onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  );
});
