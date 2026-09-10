import { startOfDay, startOfMonth, subDays, subMonths } from "date-fns";
import { fromDateValue, fromMonthValue, toDateValue, toMonthValue } from "../../utils";

export interface DateFieldShortcut {
  value: string;
  label: string;
}

export interface ResolveShortcutOptions {
  /** 기간 계산 기준이 되는 종료일. 없거나 유효하지 않으면 오늘/당월을 쓴다. */
  to?: string;
  now?: Date;
}

/** 일 단위 숏컷 카탈로그 (value / label로 조회 가능) */
export const DAY_SHORTCUT_BY_KEY = {
  yesterday: { value: "yesterday", label: "전일" },
  today: { value: "today", label: "당일" },
  last7: { value: "last7", label: "7일" },
  last15: { value: "last15", label: "15일" },
  last30: { value: "last30", label: "1개월" },
  last90: { value: "last90", label: "3개월" },
} as const;

const DAY_SHORTCUT_LIST = Object.values(DAY_SHORTCUT_BY_KEY);

/** 월 단위 숏컷 카탈로그 */
export const MONTH_SHORTCUT_BY_KEY = {
  lastMonth: { value: "lastMonth", label: "전월" },
  thisMonth: { value: "thisMonth", label: "당월" },
  last3Months: { value: "last3Months", label: "3개월" },
  last6Months: { value: "last6Months", label: "6개월" },
} as const;

const MONTH_SHORTCUT_LIST = Object.values(MONTH_SHORTCUT_BY_KEY);

/** 일 단위 기본 숏컷. 전일, 당일, 7일, 15일, 1개월, 3개월 */
export const DEFAULT_DAY_SHORTCUTS = DAY_SHORTCUT_LIST;

/** 월 단위 기본 숏컷. 전월, 당월, 3개월, 6개월 */
export const DEFAULT_MONTH_SHORTCUTS = MONTH_SHORTCUT_LIST;

/** to 날짜(없으면 오늘)를 종료일로 두고 숏컷 기간을 계산한다. */
export function resolveDayShortcut(
  value: string,
  options: ResolveShortcutOptions = {},
): { from: string; to: string } | null {
  const now = startOfDay(options.now ?? new Date());
  const anchor = fromDateValue(options.to) ?? now;

  switch (value) {
    case "today":
      return { from: toDateValue(anchor), to: toDateValue(anchor) };
    case "yesterday": {
      const day = subDays(anchor, 1);
      return { from: toDateValue(day), to: toDateValue(day) };
    }
    case "last7":
      return { from: toDateValue(subDays(anchor, 6)), to: toDateValue(anchor) };
    case "last15":
      return { from: toDateValue(subDays(anchor, 14)), to: toDateValue(anchor) };
    case "last30":
      return { from: toDateValue(subDays(anchor, 29)), to: toDateValue(anchor) };
    case "last90":
      return { from: toDateValue(subDays(anchor, 89)), to: toDateValue(anchor) };
    default:
      return null;
  }
}

/** to 월(없으면 당월)을 종료월로 두고 숏컷 기간을 계산한다. */
export function resolveMonthShortcut(
  value: string,
  options: ResolveShortcutOptions = {},
): { from: string; to: string } | null {
  const now = startOfMonth(options.now ?? new Date());
  const anchor = fromMonthValue(options.to) ?? now;

  switch (value) {
    case "thisMonth":
      return { from: toMonthValue(anchor), to: toMonthValue(anchor) };
    case "lastMonth": {
      const prev = subMonths(anchor, 1);
      return { from: toMonthValue(prev), to: toMonthValue(prev) };
    }
    case "last3Months":
      return { from: toMonthValue(subMonths(anchor, 2)), to: toMonthValue(anchor) };
    case "last6Months":
      return { from: toMonthValue(subMonths(anchor, 5)), to: toMonthValue(anchor) };
    default:
      return null;
  }
}

/** 부모가 넘긴 숏컷을 정규화한다. 없으면 fallback을 쓴다. */
export function resolveShortcutOptions(
  shortcuts: Array<DateFieldShortcut | string> | undefined,
  fallback: DateFieldShortcut[] = DEFAULT_DAY_SHORTCUTS,
  catalog: DateFieldShortcut[] = DAY_SHORTCUT_LIST,
): DateFieldShortcut[] {
  const normalize = (item: DateFieldShortcut | string): DateFieldShortcut => {
    if (typeof item !== "string") return item;

    const matched = catalog.find((shortcut) => shortcut.label === item || shortcut.value === item);
    if (matched) return matched;

    return { value: item, label: item };
  };

  return (shortcuts && shortcuts.length > 0 ? shortcuts : fallback).map(normalize);
}
