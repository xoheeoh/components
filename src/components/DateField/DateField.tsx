import { forwardRef, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { toDateValue, toMonthValue } from "../../utils";
import { Select, type SelectOption } from "../Select";
import { DateFieldInput } from "./DateFieldInput";
import type { DateFieldGranularity, DateFieldSize } from "./DateFieldInput";
import styles from "./DateField.module.css";
import {
  DEFAULT_DAY_SHORTCUTS,
  DEFAULT_MONTH_SHORTCUTS,
  resolveDayShortcut,
  resolveMonthShortcut,
  resolveShortcutOptions,
  type DateFieldShortcut,
} from "./shortcuts";

export type DateFieldMode = "single" | "range";
export type { DateFieldGranularity, DateFieldShortcut, DateFieldSize };

interface DateFieldSharedProps {
  label?: string;
  disabled?: boolean;
  /**
   * 추가 className.
   * - single: input 요소에 적용
   * - range: 필드 wrapper에 적용
   */
  className?: string;
  /** 일 단위 또는 월 단위. 기본값 date */
  granularity?: DateFieldGranularity;
  /** 필드 크기. 기본값 md */
  size?: DateFieldSize;
  /** true면 부모 너비에 맞춤. range 기본값 false */
  fullWidth?: boolean;
  /**
   * true면 값이 비어 있을 때 오늘로 초기화.
   * - single: 오늘(또는 이번 달)
   * - range: from=to=오늘(또는 이번 달), 일 단위는 숏컷 "당일"
   */
  defaultToday?: boolean;
}

export interface DateFieldSingleProps extends DateFieldSharedProps {
  mode?: "single";
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  /** 팝오버에서 선택 가능한 최소일 (YYYY-MM-DD). granularity="date"일 때만 유효 */
  min?: string;
  /** 팝오버에서 선택 가능한 최대일 (YYYY-MM-DD). granularity="date"일 때만 유효 */
  max?: string;
  placeholder?: string;
  id?: string;
  name?: string;
}

export interface DateFieldRangeProps extends DateFieldSharedProps {
  mode: "range";
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  /** 숏컷 선택 값 (제어 모드). */
  shortcut?: string;
  onShortcutChange?: (value: string) => void;
  /**
   * range 모드 기간 숏컷.
   * - date: DEFAULT_DAY_SHORTCUTS
   * - month: DEFAULT_MONTH_SHORTCUTS
   */
  shortcuts?: Array<DateFieldShortcut | string>;
  /** range 모드에서 숏컷 Select 표시 여부. */
  showShortcuts?: boolean;
}

export type DateFieldProps = DateFieldSingleProps | DateFieldRangeProps;

function FieldChrome({
  label,
  required,
  labelId,
  htmlFor,
  children,
  className,
  size,
}: {
  label?: string;
  required?: boolean;
  labelId?: string;
  htmlFor?: string;
  children: ReactNode;
  className: string;
  size: DateFieldSize;
}) {
  const labelClass = [styles.label, styles[size]].join(" ");

  return (
    <div className={className}>
      {label && htmlFor && (
        <label className={labelClass} htmlFor={htmlFor}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {label && !htmlFor && (
        <span className={labelClass} id={labelId}>
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

const DateFieldSingle = forwardRef<HTMLInputElement, DateFieldSingleProps>(function DateFieldSingle(
  {
    granularity = "date",
    size = "md",
    label,
    id,
    className,
    value,
    onValueChange,
    required,
    min,
    max,
    disabled,
    placeholder,
    fullWidth,
    name,
    defaultToday = false,
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const appliedByDefaultToday = useRef(false);

  useEffect(() => {
    if (defaultToday) {
      if (value) return;

      appliedByDefaultToday.current = true;
      onValueChange(granularity === "month" ? toMonthValue(new Date()) : toDateValue(new Date()));
      return;
    }

    if (!appliedByDefaultToday.current) return;

    appliedByDefaultToday.current = false;
    onValueChange("");
  }, [defaultToday, granularity, value, onValueChange]);

  const fieldClass = [
    styles.field,
    styles[size],
    styles.single,
    granularity === "month" ? styles.singleMonth : "",
    fullWidth ? styles.fullWidth : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldChrome label={label} required={required} htmlFor={inputId} className={fieldClass} size={size}>
      <DateFieldInput
        ref={ref}
        id={inputId}
        name={name}
        granularity={granularity}
        size={size}
        value={value}
        onValueChange={(next) => {
          appliedByDefaultToday.current = false;
          onValueChange(next);
        }}
        min={min}
        max={max}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={className}
      />
    </FieldChrome>
  );
});

function DateFieldRange({
  granularity = "date",
  size = "md",
  label,
  from,
  to,
  onFromChange,
  onToChange,
  shortcut: shortcutProp,
  onShortcutChange,
  shortcuts,
  showShortcuts = true,
  defaultToday = false,
  fullWidth = false,
  disabled,
  className,
}: DateFieldRangeProps) {
  const labelId = useId();
  const isDate = granularity === "date";
  const shortcutDefaults = isDate ? DEFAULT_DAY_SHORTCUTS : DEFAULT_MONTH_SHORTCUTS;
  const shortcutOptions: SelectOption[] = resolveShortcutOptions(shortcuts, shortcutDefaults, shortcutDefaults);

  const isShortcutControlled = shortcutProp !== undefined;
  const [internalShortcut, setInternalShortcut] = useState("");
  const shortcut = isShortcutControlled ? shortcutProp : internalShortcut;
  const appliedByDefaultToday = useRef(false);

  const setShortcut = (next: string) => {
    if (!isShortcutControlled) setInternalShortcut(next);
    onShortcutChange?.(next);
  };

  const applyShortcut = (next: string) => {
    setShortcut(next);

    const resolved = isDate ? resolveDayShortcut(next, { to }) : resolveMonthShortcut(next, { to });
    if (!resolved) return;

    onFromChange(resolved.from);
    onToChange(resolved.to);
  };

  const clearShortcut = () => {
    if (shortcut) setShortcut("");
  };

  useEffect(() => {
    if (defaultToday) {
      if (from || to) return;

      appliedByDefaultToday.current = true;

      if (isDate) {
        const resolved = resolveDayShortcut("today");
        if (!resolved) return;
        setShortcut("today");
        onFromChange(resolved.from);
        onToChange(resolved.to);
        return;
      }

      const resolved = resolveMonthShortcut("thisMonth");
      if (!resolved) return;
      setShortcut("thisMonth");
      onFromChange(resolved.from);
      onToChange(resolved.to);
      return;
    }

    if (!appliedByDefaultToday.current) return;

    appliedByDefaultToday.current = false;
    setShortcut("");
    onFromChange("");
    onToChange("");
  }, [defaultToday, from, to, isDate, onFromChange, onToChange]);

  return (
    <FieldChrome
      label={label}
      labelId={labelId}
      className={[
        styles.field,
        styles[size],
        styles.range,
        isDate ? "" : styles.rangeMonth,
        fullWidth ? styles.fullWidth : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      size={size}>
      <div className={styles.row} role="group" aria-labelledby={label ? labelId : undefined}>
        <div className={styles.picker}>
          <DateFieldInput
            granularity={granularity}
            size={size}
            value={from}
            disabled={disabled}
            onValueChange={(next) => {
              appliedByDefaultToday.current = false;
              clearShortcut();
              onFromChange(next);
            }}
          />
        </div>
        <span className={styles.separator} aria-hidden>
          ~
        </span>
        <div className={styles.picker}>
          <DateFieldInput
            granularity={granularity}
            size={size}
            value={to}
            disabled={disabled}
            onValueChange={(next) => {
              appliedByDefaultToday.current = false;
              clearShortcut();
              onToChange(next);
            }}
          />
        </div>
        {showShortcuts && (
          <div className={styles.shortcut}>
            <Select
              options={shortcutOptions}
              value={shortcut}
              size={size}
              placeholder="기간"
              disabled={disabled}
              onValueChange={applyShortcut}
              aria-label="기간 숏컷"
            />
          </div>
        )}
      </div>
    </FieldChrome>
  );
}

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(function DateField(props, ref) {
  if (props.mode === "range") {
    return <DateFieldRange {...props} />;
  }
  return <DateFieldSingle {...props} ref={ref} />;
});
