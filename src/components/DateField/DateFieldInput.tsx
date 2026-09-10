import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { mdiCalendar } from "@mdi/js";
import { Calendar } from "../Calendar";
import {
  fromDateValue,
  fromMonthValue,
  isDateValue,
  isMonthValue,
  toDateValue,
  toMonthValue,
} from "../../utils";
import { Icon } from "../Icon";
import styles from "./DateField.module.css";

export type DateFieldGranularity = "date" | "month";
export type DateFieldSize = "sm" | "md" | "lg";

const ICON_SIZE: Record<DateFieldSize, number> = {
  sm: 18,
  md: 20,
  lg: 24,
};

/** 팝오버 안에서 Tab으로 이동 가능한 요소. 달력의 날짜 버튼은 포커스된 하나만 tabIndex 0이다. */
function getTabbable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.tabIndex !== -1);
}

export interface DateFieldInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "size"
> {
  granularity?: DateFieldGranularity;
  size?: DateFieldSize;
  value?: string;
  onValueChange?: (value: string) => void;
  min?: string;
  max?: string;
}

export const DateFieldInput = forwardRef<HTMLInputElement, DateFieldInputProps>(
  function DateFieldInput(
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
    ref,
  ) {
    const isMonth = granularity === "month";
    const inputRef = useRef<HTMLInputElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const popoverId = useId();
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

    /**
     * 팝오버는 body 끝에 포털되므로 Tab 순서만으로는 도달할 수 없다.
     * 열릴 때 달력 안으로 포커스를 옮기고(Calendar autoFocus), 닫힐 때 연 버튼으로 되돌린다.
     * 마우스로 바깥을 클릭해 닫힐 때는 사용자가 고른 곳의 포커스를 훔치지 않는다.
     */
    const closePopover = (restoreFocus: boolean) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    };

    useEffect(() => {
      if (!open) return;

      const isInside = (target: Node | null) =>
        Boolean(
          target && (rootRef.current?.contains(target) || popoverRef.current?.contains(target)),
        );

      const onPointerDown = (event: PointerEvent) => {
        if (isInside(event.target as Node)) return;
        closePopover(false);
      };
      // 포커스가 필드·팝오버 밖으로 나가면 닫는다 (마우스로 다른 입력을 클릭한 경우 등).
      const onFocusIn = (event: FocusEvent) => {
        if (isInside(event.target as Node | null)) return;
        closePopover(false);
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape") return;
        // Dialog가 event.defaultPrevented로 "안쪽 팝오버가 소비했는지"를 판단하므로,
        // preventDefault를 호출해야 감싸는 Dialog까지 닫히지 않는다. (Select와 동일)
        event.preventDefault();
        closePopover(true);
      };

      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("focusin", onFocusIn);
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("focusin", onFocusIn);
        document.removeEventListener("keydown", onKeyDown);
      };
    }, [open]);

    /**
     * Tab을 팝오버 안에서 순환시킨다. 포털 뒤에는 이동할 곳이 없어 포커스가 페이지 밖으로
     * 빠지기 때문이다. 나가는 길은 Escape(버튼으로 복귀)와 날짜 선택이다.
     */
    const handlePopoverKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Tab") return;
      const nodes = getTabbable(event.currentTarget);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

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
            autoComplete="off"
            placeholder={resolvedPlaceholder}
            className={inputClass}
            value={draft}
            disabled={disabled}
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
            ref={triggerRef}
            type="button"
            className={[styles.trigger, styles[size]].join(" ")}
            disabled={disabled}
            aria-label="달력 열기"
            // 팝오버를 여는 컨트롤은 이 버튼이므로 열림 상태 속성도 여기에 둔다
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls={open ? popoverId : undefined}
            onClick={() => (open ? closePopover(false) : setOpen(true))}
          >
            <Icon path={mdiCalendar} size={ICON_SIZE[size]} />
          </button>
        </div>
        {open &&
          !disabled &&
          popoverPos &&
          createPortal(
            <div
              ref={popoverRef}
              id={popoverId}
              className={styles.popover}
              role="dialog"
              aria-label={isMonth ? "월 선택" : "날짜 선택"}
              style={{ top: popoverPos.top, left: popoverPos.left }}
              onKeyDown={handlePopoverKeyDown}
            >
              {isMonth ? (
                <Calendar
                  mode="month"
                  autoFocus
                  selected={fromMonthValue(value)}
                  onSelect={(date) => {
                    commit(toMonthValue(date));
                    closePopover(true);
                  }}
                />
              ) : (
                <Calendar
                  mode="date"
                  autoFocus
                  selected={fromDateValue(value)}
                  defaultMonth={fromDateValue(value)}
                  disabled={[
                    ...(fromDateValue(min) ? [{ before: fromDateValue(min)! }] : []),
                    ...(fromDateValue(max) ? [{ after: fromDateValue(max)! }] : []),
                  ]}
                  onSelect={(date) => {
                    if (!date) return;
                    commit(toDateValue(date));
                    closePopover(true);
                  }}
                />
              )}
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
