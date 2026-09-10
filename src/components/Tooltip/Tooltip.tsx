import { cloneElement, isValidElement, useId, type HTMLAttributes, type ReactNode } from "react";
import styles from "./Tooltip.module.css";

export type TooltipPosition = "top" | "right" | "bottom" | "left";
export type TooltipSize = "sm" | "md";
export type ArrowPosition = "vertical" | "horizontal";
export type VerticalAlign = "leading" | "center" | "trailing";
export type HorizontalAlign = "top" | "center" | "bottom";

type TooltipBaseProps = Omit<HTMLAttributes<HTMLSpanElement>, "content"> & {
  /** 툴팁에 표시할 내용 */
  content: ReactNode;
  /**
   * 트리거(아이콘 버튼 등). 요소 하나를 넘기면 aria-describedby가 그 요소에 붙어
   * 포커스 시 스크린리더가 툴팁 내용을 읽는다. 커스텀 컴포넌트라면 받은 props를
   * 실제 DOM 요소에 전달해야 하고, 키보드로 띄우려면 포커스 가능해야 한다.
   */
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

/** 호버/포커스 시 트리거 옆에 안내 문구를 띄운다. */
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
  const tipClass = [styles.tooltip, styles[position], styles[size], styles[theme]]
    .filter(Boolean)
    .join(" ");

  // 감싸는 span은 포커스를 받지 않아 여기에 aria-describedby를 두면 아무 요소와도 연결되지 않는다.
  // 자식이 요소 하나면 그 요소에 직접 붙이고, 이미 있는 값은 뒤에 이어 붙인다.
  const trigger = isValidElement<{ "aria-describedby"?: string }>(children)
    ? cloneElement(children, {
        "aria-describedby": [children.props["aria-describedby"], tooltipId]
          .filter(Boolean)
          .join(" "),
      })
    : children;

  return (
    <span className={rootClass} {...rest}>
      {trigger}
      <span
        id={tooltipId}
        role="tooltip"
        className={tipClass}
        data-arrow={arrow}
        data-align={resolvedAlign}
      >
        {content}
      </span>
    </span>
  );
}
