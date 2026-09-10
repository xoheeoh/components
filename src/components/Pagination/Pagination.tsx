import { useLayoutEffect, useState, type CSSProperties, type HTMLAttributes } from "react";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
import { Icon } from "../Icon";
import styles from "./Pagination.module.css";

export type PaginationType = "dot" | "number";
export type PaginationDotSize = "sm" | "md";
export type PaginationDotColor = "neutral" | "primary";

type PaginationBaseProps = Omit<HTMLAttributes<HTMLElement>, "onChange"> & {
  /** 전체 페이지 수 */
  count: number;
  /** 한 번에 보여줄 페이지 개수. 기본값 5. number는 숫자 칸, dot은 점 개수 */
  visibleCount?: number;
  /** 제어 모드 현재 페이지. 1부터 시작 */
  page?: number;
  /** 비제어 모드 초기 페이지. 기본값 1 */
  defaultPage?: number;
  onChange?: (page: number) => void;
};

export type PaginationNumberProps = PaginationBaseProps & {
  type: "number";
  size?: never;
  color?: never;
};

export type PaginationDotProps = PaginationBaseProps & {
  type: "dot";
  /** 점 기준 크기. sm은 8px, md는 12px. 기본값 md */
  size?: PaginationDotSize;
  /** 점 색. primary는 primary-fg 기준으로 연해짐. 기본값 primary */
  color?: PaginationDotColor;
};

export type PaginationProps = PaginationNumberProps | PaginationDotProps;

type PageItem = number | "ellipsis";

type DotTrackStyle = CSSProperties & {
  "--dot-start"?: string;
  "--dot-visible"?: string;
};

function clampPage(page: number, count: number) {
  if (count < 1) return 1;
  return Math.min(count, Math.max(1, page));
}

function getNumberItems(current: number, count: number, visibleCount: number): PageItem[] {
  if (count <= visibleCount) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  let start: number;
  let end: number;

  if (current <= visibleCount) {
    start = 1;
    end = visibleCount;
  } else if (current > count - visibleCount) {
    start = count - visibleCount + 1;
    end = count;
  } else {
    const side = Math.floor((visibleCount - 1) / 2);
    start = current - side;
    end = start + visibleCount - 1;
  }

  const items: PageItem[] = [];

  if (start > 1) {
    items.push(1);
    if (start === 3) items.push(2);
    else if (start > 2) items.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) items.push(page);

  if (end < count) {
    if (end === count - 2) items.push(count - 1);
    else if (end < count - 1) items.push("ellipsis");
    items.push(count);
  }

  return items;
}

function getMaxDotStart(count: number, visibleCount: number) {
  return Math.max(1, count - visibleCount + 1);
}

function getInitialDotStart(current: number, count: number, visibleCount: number) {
  if (count <= visibleCount) return 1;
  const maxStart = getMaxDotStart(count, visibleCount);
  if (current <= visibleCount) return 1;
  if (current > count - visibleCount) return maxStart;
  return Math.min(Math.max(1, current - Math.floor((visibleCount - 1) / 2)), maxStart);
}

/** 선택된 페이지가 창 안에 있는 한 창을 유지하고, 밖으로 나가거나 끝 칸이면 그때만 민다 */
function adjustDotStart(prev: number, current: number, count: number, visibleCount: number) {
  if (count <= visibleCount) return 1;

  const maxStart = getMaxDotStart(count, visibleCount);
  let start = Math.min(Math.max(1, prev), maxStart);
  const end = start + visibleCount - 1;

  if (current < start) start = current;
  else if (current > end) start = current - visibleCount + 1;

  start = Math.min(Math.max(1, start), maxStart);

  const nextEnd = start + visibleCount - 1;
  if (current === nextEnd && current < count) start = Math.min(start + 1, maxStart);
  else if (current === start && current > 1) start = Math.max(1, start - 1);

  return start;
}

/** 점 또는 숫자로 페이지를 이동하는 페이지네이션 */
export function Pagination({
  type,
  count,
  visibleCount = 5,
  page,
  defaultPage = 1,
  onChange,
  className,
  ...rest
}: PaginationProps) {
  const {
    size: dotSize,
    color: dotColor,
    ...navRest
  } = rest as Omit<HTMLAttributes<HTMLElement>, "onChange"> & {
    size?: PaginationDotSize;
    color?: PaginationDotColor;
  };
  const size = type === "dot" ? (dotSize ?? "md") : "md";
  const color = type === "dot" ? (dotColor ?? "primary") : "primary";
  const isControlled = page !== undefined;
  const [uncontrolledPage, setUncontrolledPage] = useState(defaultPage);
  const currentPage = clampPage(isControlled ? page : uncontrolledPage, count);
  const windowSize = Math.max(1, visibleCount);
  const total = Math.max(0, count);
  const [dotStart, setDotStart] = useState(() =>
    getInitialDotStart(currentPage, total, windowSize),
  );

  const setPage = (next: number) => {
    const clamped = clampPage(next, count);
    if (clamped === currentPage) return;
    if (!isControlled) setUncontrolledPage(clamped);
    onChange?.(clamped);
  };

  useLayoutEffect(() => {
    if (type !== "dot") return;
    setDotStart((prev) => adjustDotStart(prev, currentPage, total, windowSize));
  }, [type, currentPage, total, windowSize]);

  const numberItems = type === "number" ? getNumberItems(currentPage, total, windowSize) : [];
  const visibleDots = Math.min(windowSize, Math.max(total, 1));
  const rootClass = [styles.root, type === "number" ? styles.number : "", className]
    .filter(Boolean)
    .join(" ");
  const dotTrackStyle: DotTrackStyle = {
    "--dot-start": String(dotStart),
    "--dot-visible": String(visibleDots),
  };

  return (
    <nav className={rootClass} aria-label="페이지 매김" {...navRest}>
      {type === "number" && (
        <button
          type="button"
          className={styles.navButton}
          aria-label="이전 페이지"
          disabled={currentPage <= 1}
          onClick={() => setPage(currentPage - 1)}
        >
          <Icon path={mdiChevronLeft} size={20} />
        </button>
      )}

      {type === "dot" ? (
        <div
          className={[styles.dotViewport, styles[size], styles[color]].join(" ")}
          style={dotTrackStyle}
        >
          <ul className={styles.list}>
            {Array.from({ length: total }, (_, i) => i + 1).map((item) => {
              const selected = item === currentPage;
              const distance = Math.min(Math.abs(item - currentPage), 4);

              return (
                <li key={item}>
                  <button
                    type="button"
                    className={styles.dot}
                    data-distance={distance}
                    aria-label={`${item}페이지`}
                    aria-current={selected ? "page" : undefined}
                    onClick={() => setPage(item)}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <ul className={styles.list}>
          {numberItems.map((item, index) => {
            if (item === "ellipsis") {
              return (
                <li key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden>
                  ...
                </li>
              );
            }

            const selected = item === currentPage;

            return (
              <li key={item}>
                <button
                  type="button"
                  className={styles.page}
                  aria-label={`${item}페이지`}
                  aria-current={selected ? "page" : undefined}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {type === "number" && (
        <button
          type="button"
          className={styles.navButton}
          aria-label="다음 페이지"
          disabled={currentPage >= count}
          onClick={() => setPage(currentPage + 1)}
        >
          <Icon path={mdiChevronRight} size={20} />
        </button>
      )}
    </nav>
  );
}
