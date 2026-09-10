import { forwardRef, ReactNode, type ButtonHTMLAttributes, type CSSProperties } from "react";
import styles from "./Button.module.css";
import { Spinner } from "../Spinner";

export type ButtonVariant = "solid" | "outlined";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonColor = "primary" | "neutral" | "destructive";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 라벨 (필수) */
  label: string;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  onClick?: () => void;
  disabled?: boolean;
  /** inline style. 예: `{ minWidth: 100 }` */
  style?: CSSProperties;
  className?: string;

  loading?: boolean;
  /** 버튼 아이콘. 버튼 라벨 옆에 표시됨 */
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
}

/** 공용 버튼 컴포넌트 — Input, Select와 size(height) 동일 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    label,
    type = "button",
    variant = "solid",
    size = "md",
    color = "primary",
    onClick,
    disabled,
    style,
    className,
    loading,
    icon,
    iconPosition = "left",
    iconOnly = false,
    ...rest
  },
  ref,
) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    styles[color],
    iconOnly && styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const spinnerSize = size === "lg" ? "md" : size === "sm" ? "xs" : "sm";

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      style={style}
      onClick={onClick}
      disabled={disabled}
      aria-label={iconOnly ? label : undefined}
      {...rest}
    >
      <span className={styles.label}>
        <span
          className={loading ? styles.labelHidden : undefined}
          aria-hidden={loading || undefined}
        >
          {icon && iconPosition === "left" && icon}
          {iconOnly ? null : label}
          {icon && iconPosition === "right" && icon}
        </span>
        {loading ? (
          <Spinner size={spinnerSize} color="current" className={styles.loadingSpinner} />
        ) : null}
      </span>
    </button>
  );
});
