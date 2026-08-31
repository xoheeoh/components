import { forwardRef, type HTMLAttributes } from "react";
import styles from "./Spinner.module.css";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  /** 접근성용 라벨. 화면에 표시되지 않음 */
  label?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", label = "로딩 중", className, ...rest },
  ref
) {
  const classes = [styles.spinner, styles[size], className].filter(Boolean).join(" ");

  return (
    <span ref={ref} className={classes} role="status" aria-live="polite" aria-label={label} {...rest}>
      <span className={styles.visuallyHidden}>{label}</span>
    </span>
  );
});
