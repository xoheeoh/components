import { useState } from "react";
import { format } from "date-fns";
import { ko as dateFnsKo } from "date-fns/locale";
import { Chevron, DayPicker, type PropsBase, type PropsSingle } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import "react-day-picker/style.css";
import styles from "./Calendar.module.css";

export type CalendarMode = "date" | "month";

export type DateCalendarProps = Omit<PropsBase & PropsSingle, "mode" | "required"> & {
  /** 일 단위 달력. 기본값 */
  mode?: "date";
};

export interface MonthCalendarProps {
  mode: "month";
  /** 선택된 연월 (해당 달의 아무 날짜든 가능) */
  selected?: Date;
  onSelect?: (date: Date) => void;
  /** 표시 중인 연도. 미지정 시 selected 또는 현재 연도 */
  year?: number;
  onYearChange?: (year: number) => void;
  className?: string;
}

export type CalendarProps = DateCalendarProps | MonthCalendarProps;

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

function DateCalendar({
  className,
  classNames,
  locale = ko,
  showOutsideDays = true,
  mode: _mode,
  ...rest
}: DateCalendarProps) {
  return (
    <DayPicker
      mode="single"
      locale={locale}
      showOutsideDays={showOutsideDays}
      className={[styles.root, className].filter(Boolean).join(" ")}
      classNames={{
        ...classNames,
      }}
      {...rest}
    />
  );
}

function MonthCalendar({ selected, onSelect, year: controlledYear, onYearChange, className }: MonthCalendarProps) {
  const selectedYear = selected?.getFullYear();
  const [internalYear, setInternalYear] = useState(() => selectedYear ?? new Date().getFullYear());
  const year = controlledYear ?? internalYear;

  const setYear = (next: number) => {
    if (controlledYear == null) setInternalYear(next);
    onYearChange?.(next);
  };

  return (
    <div className={[styles.root, styles.monthRoot, className].filter(Boolean).join(" ")}>
      <div className={styles.monthNav}>
        <button type="button" className="rdp-button_previous" aria-label="이전 해" onClick={() => setYear(year - 1)}>
          <Chevron orientation="left" className="rdp-chevron" />
        </button>
        <span className={styles.monthCaption}>{year}년</span>
        <button type="button" className="rdp-button_next" aria-label="다음 해" onClick={() => setYear(year + 1)}>
          <Chevron orientation="right" className="rdp-chevron" />
        </button>
      </div>
      <div className={styles.monthGrid} role="listbox" aria-label="월 선택">
        {MONTHS.map((month) => {
          const isSelected = selected != null && selected.getFullYear() === year && selected.getMonth() === month;
          const label = format(new Date(year, month, 1), "M월", { locale: dateFnsKo });

          return (
            <button
              key={month}
              type="button"
              role="option"
              aria-selected={isSelected}
              className={[styles.monthCell, isSelected ? styles.monthSelected : ""].filter(Boolean).join(" ")}
              onClick={() => onSelect?.(new Date(year, month, 1))}>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Calendar(props: CalendarProps) {
  if (props.mode === "month") {
    return <MonthCalendar {...props} />;
  }
  return <DateCalendar {...props} />;
}
