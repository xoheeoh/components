import { format, isValid, parse, startOfDay } from "date-fns";

export function toDateValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * date-fns parse는 자릿수에 관대해서 "24-01-05"를 서기 24년, "2024-1-5"를 유효한 날짜로 본다.
 * 입력값이 그대로 부모에 전달되므로, 자릿수가 정확한 형식만 통과시킨다.
 */
const DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_VALUE_PATTERN = /^\d{4}-\d{2}$/;

export function fromDateValue(value: string | undefined): Date | undefined {
  if (!value || !DATE_VALUE_PATTERN.test(value)) return undefined;
  const date = parse(value, "yyyy-MM-dd", new Date());
  return isValid(date) ? startOfDay(date) : undefined;
}

export function toMonthValue(date: Date): string {
  return format(date, "yyyy-MM");
}

export function fromMonthValue(value: string | undefined): Date | undefined {
  if (!value || !MONTH_VALUE_PATTERN.test(value)) return undefined;
  const date = parse(value, "yyyy-MM", new Date());
  return isValid(date) ? startOfDay(date) : undefined;
}

export function isDateValue(value: string): boolean {
  return fromDateValue(value) != null;
}

export function isMonthValue(value: string): boolean {
  return fromMonthValue(value) != null;
}
