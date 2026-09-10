import type { CSSProperties, SVGAttributes } from "react";

export type IconPath = string;

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, "children" | "viewBox"> {
  path: IconPath;
  /** 아이콘 크기 (px). 기본 24 */
  size?: number;
  className?: string;
  color?: string;
}

/** @mdi/js path 상수 — https://pictogrammers.com/library/mdi/ 에서 검색 후 import해서 사용
 * - ex) `import { mdiHome } from "@mdi/js";`
 */
export function Icon({ path, size = 24, className = "", color, style, ...rest }: IconProps) {
  const mergedStyle: CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
    ...style,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={["mdi-icon", className].filter(Boolean).join(" ")}
      style={mergedStyle}
      aria-hidden
      {...rest}
    >
      <path d={path} fill={color ?? "currentColor"} />
    </svg>
  );
}
