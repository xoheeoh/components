import { useId, type HTMLAttributes, type ReactNode } from "react";
import styles from "./Tooltip.module.css";

export type TooltipPosition = "top" | "right" | "bottom" | "left";
export type TooltipSize = "sm" | "md";
export type ArrowPosition = "vertical" | "horizontal";
export type VerticalAlign = "leading" | "center" | "trailing";
export type HorizontalAlign = "top" | "center" | "bottom";

type TooltipBaseProps = Omit<HTMLAttributes<HTMLSpanElement>, "content"> & {
  /** 툴팁에 표시할 내용 */
  content: ReactNode;
  /** 트리거(아이콘 등) */
  children: ReactNode;
  /** 툴팁 위치 */
  position: TooltipPosition;
  size?: TooltipSize;
  theme?: "light" | "dark";
};

export type TooltipVerticalProps = TooltipBaseProps & {
  arrow: "vertical";
  /** 화살표가 vertical일 때. 기본값 leading */
  align?: VerticalAlign;
};

export type TooltipHorizontalProps = TooltipBaseProps & {
  arrow: "horizontal";
  /** 화살표가 horizontal일 때. 기본값 top */
  align?: HorizontalAlign;
};

export type TooltipProps = TooltipVerticalProps | TooltipHorizontalProps;

/** 호버/포커스 시 트리거 옆에 안내 문구를 띄움 */
export function Tooltip({
  content,
  children,
  position,
  size = "md",
  arrow,
  align,
  theme = "light",
  className,
  ...rest
}: TooltipProps) {
  const tooltipId = useId();
  const resolvedAlign = align ?? (arrow === "vertical" ? "leading" : "top");
  const rootClass = [styles.root, className].filter(Boolean).join(" ");
  const tipClass = [styles.tooltip, styles[position], styles[size], styles[theme]].filter(Boolean).join(" ");

  return (
    <span className={rootClass} {...rest} aria-describedby={tooltipId}>
      {children}
      <span id={tooltipId} role="tooltip" className={tipClass} data-arrow={arrow} data-align={resolvedAlign}>
        {content}
      </span>
    </span>
  );
}
