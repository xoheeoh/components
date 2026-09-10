import { ButtonHTMLAttributes, CSSProperties, forwardRef, ReactNode } from "react";
import { Spinner } from "../Spinner";
import styles from "./TextButton.module.css";

export type TextButtonColor = "primary" | "neutral" | "destructive";

export interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 라벨 (필수) */
  label: string;
  type?: "button" | "submit" | "reset";
  color?: TextButtonColor;
  size?: "sm" | "md";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(function TextButton(
  {
    label,
    type = "button",
    color = "primary",
    size = "md",
    icon,
    iconPosition = "left",
    disabled = false,
    loading = false,
    onClick,
    className,
    style,
    ...rest
  },
  ref,
) {
  const classes = [styles.textButton, styles[color], styles[size], className]
    .filter(Boolean)
    .join(" ");
  const spinnerSize = size === "md" ? "sm" : "xs";

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      style={style}
      // loading 중에는 클릭(Enter/Space 포함)과 폼 제출을 막는다. Button과 같은 이유로 disabled는 쓰지 않는다.
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.();
      }}
      disabled={disabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className={styles.label}>
        <span
          className={loading ? styles.labelHidden : styles.labelContent}
          aria-hidden={loading || undefined}
        >
          {icon && iconPosition === "left" && icon}
          {label}
          {icon && iconPosition === "right" && icon}
        </span>
        {loading ? (
          <Spinner size={spinnerSize} color="current" className={styles.loadingSpinner} />
        ) : null}
      </span>
    </button>
  );
});
