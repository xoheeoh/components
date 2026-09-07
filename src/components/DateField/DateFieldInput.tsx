import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { mdiCalendar } from "@mdi/js";
import { Calendar } from "../Calendar";
import { fromDateValue, fromMonthValue, isDateValue, isMonthValue, toDateValue, toMonthValue } from "../../utils";
import { Icon } from "../Icon";
import styles from "./DateField.module.css";

export type DateFieldGranularity = "date" | "month";
export type DateFieldSize = "sm" | "md" | "lg";

const ICON_SIZE: Record<DateFieldSize, number> = {
  sm: 18,
  md: 20,
  lg: 24,
};

export interface DateFieldInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "size"> {
  granularity?: DateFieldGranularity;
  size?: DateFieldSize;
  value?: string;
  onValueChange?: (value: string) => void;
  min?: string;
  max?: string;
}

export const DateFieldInput = forwardRef<HTMLInputElement, DateFieldInputProps>(function DateFieldInput(
  {
    granularity = "date",
    size = "md",
    id,
    className,
    value = "",
    onValueChange,
    min,
    max,
    disabled,
    placeholder,
    ...rest
  },
  ref
) {
  const isMonth = granularity === "month";
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>();
  const resolvedPlaceholder = placeholder ?? (isMonth ? "YYYY-MM" : "YYYY-MM-DD");
  const isValidValue = isMonth ? isMonthValue : isDateValue;

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useLayoutEffect(() => {
    if (!open) {
      setPopoverPos(undefined);
      return;
    }

    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPopoverPos({ top: rect.bottom + 4, left: rect.left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const commit = (next: string) => {
    setDraft(next);
    onValueChange?.(next);
  };

  const inputClass = [styles.input, styles[size], className].filter(Boolean).join(" ");

  return (
    <div className={[styles.controlWrap, styles[size]].join(" ")} ref={rootRef}>
      <div className={styles.control}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={resolvedPlaceholder}
          className={inputClass}
          value={draft}
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="dialog"
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            if (next === "" || isValidValue(next)) {
              onValueChange?.(next);
            }
          }}
          onBlur={() => {
            if (draft === "" || isValidValue(draft)) return;
            setDraft(value);
          }}
          {...rest}
        />
        <button
          type="button"
          className={[styles.trigger, styles[size]].join(" ")}
          disabled={disabled}
          aria-label="달력 열기"
          onClick={() => setOpen((prev) => !prev)}>
          <Icon path={mdiCalendar} size={ICON_SIZE[size]} />
        </button>
      </div>
      {open &&
        !disabled &&
        popoverPos &&
        createPortal(
          <div
            ref={popoverRef}
            className={styles.popover}
            role="dialog"
            aria-label={isMonth ? "월 선택" : "날짜 선택"}
            style={{ top: popoverPos.top, left: popoverPos.left }}>
            {isMonth ? (
              <Calendar
                mode="month"
                selected={fromMonthValue(value)}
                onSelect={(date) => {
                  commit(toMonthValue(date));
                  setOpen(false);
                }}
              />
            ) : (
              <Calendar
                mode="date"
                selected={fromDateValue(value)}
                defaultMonth={fromDateValue(value)}
                disabled={[
                  ...(fromDateValue(min) ? [{ before: fromDateValue(min)! }] : []),
                  ...(fromDateValue(max) ? [{ after: fromDateValue(max)! }] : []),
                ]}
                onSelect={(date) => {
                  if (!date) return;
                  commit(toDateValue(date));
                  setOpen(false);
                }}
              />
            )}
          </div>,
          document.body
        )}
    </div>
  );
});
