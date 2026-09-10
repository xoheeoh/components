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
  /** 버튼 아이콘. 버튼 라벨 옆에 표시된다. */
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
}

/** 공용 버튼 컴포넌트 — Input, Select와 size(height)가 같다. */
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
      // loading 중에는 클릭(Enter/Space 포함)과 폼 제출을 막는다.
      // disabled를 쓰지 않는 이유: 버튼이 흐려져 스피너가 안 보이고, 포커스도 잃는다.
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.();
      }}
      disabled={disabled}
      aria-busy={loading || undefined}
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
