import { forwardRef, type HTMLAttributes } from "react";
import styles from "./Spinner.module.css";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";
export type SpinnerColor = "primary" | "neutral" | "destructive" | "current";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  /** 단독 사용 시 primary. 버튼 loading은 current(부모 글자색) */
  color?: SpinnerColor;
  /** 접근성용 라벨. 화면에 표시되지 않음 */
  label?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", color = "primary", label = "로딩 중", className, ...rest },
  ref
) {
  const classes = [styles.spinner, styles[size], styles[color], className].filter(Boolean).join(" ");

  return (
    <span ref={ref} className={classes} role="status" aria-live="polite" aria-label={label} {...rest}>
      <span className={styles.visuallyHidden}>{label}</span>
    </span>
  );
});
