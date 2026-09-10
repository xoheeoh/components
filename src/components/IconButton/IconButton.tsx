import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./IconButton.module.css";

export type IconButtonVariant = "default" | "outlined" | "solid";
export type IconButtonColor = "primary" | "neutral" | "destructive";
export type IconButtonSize = "sm" | "md";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  /**
   * 버튼 이름. 아이콘은 스크린리더에 읽히지 않으므로(aria-hidden) 이 값이 유일한 이름이다.
   * 툴팁 등 다른 요소로 이름을 붙이더라도 이 값은 필요하다.
   */
  "aria-label": string;
  type?: "button" | "submit" | "reset";
  variant?: IconButtonVariant;
  /** sm(32) / md(40). `48px`처럼 길이 값도 가능 */
  size?: IconButtonSize | (string & {});
  /** 아이콘 한 변. 없으면 size에 맞춰 자동 (프리셋은 18/24, 커스텀은 버튼의 60%) */
  iconSize?: number | (string & {});
  color?: IconButtonColor;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

function toPx(value: number | string | undefined): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  const match = value.trim().match(/^(\d+(?:\.\d+)?)px$/i);
  return match ? Number(match[1]) : undefined;
}

function defaultIconPx(size: string): number | undefined {
  if (size === "sm") return 18;
  if (size === "md") return 24;
  const buttonPx = toPx(size);
  return buttonPx == null ? undefined : Math.round(buttonPx * 0.6);
}

type IconButtonStyle = CSSProperties & {
  "--btn-size"?: string;
  "--icon-size"?: string;
};

function toCssLength(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    type = "button",
    variant = "default",
    size = "md",
    iconSize,
    color = "neutral",
    disabled = false,
    className,
    style,
    ...rest
  },
  ref,
) {
  const isPreset = size === "sm" || size === "md";
  const iconPx = toPx(iconSize) ?? defaultIconPx(size);
  const classes = [
    styles.iconButton,
    styles[variant],
    styles[color],
    isPreset && styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle: IconButtonStyle = { ...style };
  if (!isPreset) {
    mergedStyle["--btn-size"] = size;
    mergedStyle["--icon-size"] =
      iconSize != null
        ? toCssLength(iconSize)
        : iconPx != null
          ? `${iconPx}px`
          : `calc(${size} * 0.6)`;
  } else if (iconSize != null) {
    mergedStyle["--icon-size"] = toCssLength(iconSize);
  }

  const renderedIcon = isValidElement<{ size?: number; style?: CSSProperties }>(icon)
    ? cloneElement(
        icon,
        iconPx != null
          ? { size: iconPx }
          : {
              style: { width: "var(--icon-size)", height: "var(--icon-size)", ...icon.props.style },
            },
      )
    : icon;

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      style={mergedStyle}
      disabled={disabled}
      {...rest}
    >
      <span className={styles.icon}>{renderedIcon}</span>
    </button>
  );
});
