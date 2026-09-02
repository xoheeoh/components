import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent,
} from "react";
import styles from "./Select.module.css";
import { Icon } from "../Icon";
import { mdiAlertCircle, mdiCheck, mdiCheckCircle, mdiChevronDown, mdiClose } from "@mdi/js";
import { createPortal } from "react-dom";

export type SelectType = "text" | "chip";
export type SelectStatus = "default" | "positive" | "negative";
export type SelectSize = "sm" | "md" | "lg";

const ICON_SIZE: Record<SelectSize, number> = {
  sm: 18,
  md: 20,
  lg: 24,
};

const CHIP_REMOVE_SIZE: Record<SelectSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

type SelectBaseProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "size" | "type" | "value" | "onClick"
> & {
  /** 라벨값. 빈 값인 경우 자동 숨김처리 */
  label?: string;
  /** 입력 필드 상태값. (예: error 발생 시 negative 사용) */
  status?: SelectStatus;
  /** 상태값에 따른 뱃지. status가 default인 경우엔 보이지 않음 */
  statusBadge?: boolean;
  size?: SelectSize;
  /** 필수 입력 필드 여부 */
  required?: boolean;
  /** 도움말 텍스트 */
  description?: string;
  disabled?: boolean;
  /**
   * 선택값 표시 방식.
   * - false: 한 줄 + 말줄임
   * - true: 너비를 넘기면 줄바꿈
   */
  overflow?: boolean;
  placeholder?: string;
  options: SelectOption[];
  /** inline style. 예: `{ width: 200 }` */
  style?: CSSProperties;
  className?: string;
};

export interface SelectSingleProps extends SelectBaseProps {
  /** 단일 선택은 text만 사용. chip을 넘겨도 텍스트로 표시됨 */
  type?: "text";
  multiple?: false;
  /** 선택된 옵션 value. 수정 화면 등 저장된 값을 넣을 때 사용 */
  value?: string;
  /** 옵션 선택 시 호출. 부모 state를 갱신할 때 사용 */
  onValueChange?: (value: string) => void;
}

export type SelectMultipleProps = SelectBaseProps & {
  /** 선택된 옵션 value 목록 */
  value?: string[];
  /** 옵션 선택/해제 시 호출 */
  onValueChange?: (value: string[]) => void;
} & ({ type?: "text"; multiple: true } | { type: "chip"; multiple?: true });

export type SelectProps = SelectSingleProps | SelectMultipleProps;

function selectedValuesOf(multiple: boolean, value: string | string[] | undefined): string[] {
  if (multiple) return Array.isArray(value) ? value : [];
  return typeof value === "string" && value !== "" ? [value] : [];
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    label,
    type = "text",
    status = "default",
    statusBadge = true,
    size = "md",
    required = false,
    description,
    disabled = false,
    overflow = false,
    multiple = false,
    placeholder,
    options,
    value,
    onValueChange,
    style,
    className,
    ...rest
  },
  ref
) {
  const isChip = type === "chip";
  const isMultiple = multiple || isChip;
  const labelClass = [styles.label, styles[size]].filter(Boolean).join(" ");
  const triggerClass = [styles.select, styles[size], styles[status], overflow && styles.selectOverflow]
    .filter(Boolean)
    .join(" ");
  const descriptionClass = [styles.description, styles[status]].filter(Boolean).join(" ");

  // 상태 뱃지
  const showBadge = statusBadge && status !== "default" && !disabled;
  const statusBadgeClass = [styles.statusBadge, styles[size], styles[status]].filter(Boolean).join(" ");
  const statusBadgeIcon = showBadge ? (
    <span className={statusBadgeClass} aria-hidden>
      <Icon path={status === "positive" ? mdiCheckCircle : mdiAlertCircle} size={ICON_SIZE[size]} />
    </span>
  ) : null;

  // 옵션 리스트 관련
  const triggerRef = useRef<HTMLButtonElement>(null); // 리스트 위치용
  const listRef = useRef<HTMLUListElement>(null);
  useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

  const [open, setOpen] = useState(false);
  const [listPos, setListPos] = useState<{ top: number; left: number; width: number }>();
  const listBoxClass = [styles.listbox, styles[size]].filter(Boolean).join(" ");
  const selectedValues = selectedValuesOf(isMultiple, value);

  useLayoutEffect(() => {
    if (!open) {
      setListPos(undefined);
      return;
    }

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setListPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  // 리스트 바깥 클릭으로 닫히게
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const selectOption = (opt: SelectOption) => {
    if (opt.disabled) return;

    if (isMultiple) {
      const next = selectedValues.includes(opt.value)
        ? selectedValues.filter((item) => item !== opt.value)
        : [...selectedValues, opt.value];
      (onValueChange as SelectMultipleProps["onValueChange"])?.(next);
      return;
    }

    (onValueChange as SelectSingleProps["onValueChange"])?.(opt.value);
    setOpen(false);
  };

  const removeChip = (item: string, event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || !isMultiple) return;
    (onValueChange as SelectMultipleProps["onValueChange"])?.(selectedValues.filter((valueItem) => valueItem !== item));
  };

  const selectedOptions = selectedValues
    .map((item) => options.find((opt) => opt.value === item))
    .filter((opt): opt is SelectOption => opt != null);
  const hasValue = selectedOptions.length > 0;
  const displayValue = hasValue ? selectedOptions.map((opt) => opt.label).join(", ") : placeholder;
  const valueClass = [styles.value, styles[size], !hasValue && styles.placeholder, overflow && styles.valueOverflow]
    .filter(Boolean)
    .join(" ");
  const chipsClass = [styles.chips, styles[size], overflow && styles.chipsOverflow].filter(Boolean).join(" ");
  const chipClass = [styles.chip, styles[size]].filter(Boolean).join(" ");
  const optionClass = [styles.option, styles[size]].filter(Boolean).join(" ");

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")} style={style}>
      {label && (
        <span className={labelClass}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </span>
      )}

      <div className={styles.control}>
        <button
          ref={triggerRef}
          type="button"
          className={triggerClass}
          disabled={disabled}
          {...rest}
          onClick={() => {
            if (disabled) return;
            setOpen((prev) => !prev);
          }}>
          <span className={styles.trailing}>
            {statusBadgeIcon}
            <Icon
              path={mdiChevronDown}
              size={ICON_SIZE[size]}
              className={[styles.chevron, open && styles.chevronOpen].filter(Boolean).join(" ")}
            />
          </span>
          {isChip && isMultiple ? (
            hasValue ? (
              <span className={chipsClass}>
                {selectedOptions.map((opt) => (
                  <span key={opt.value} className={chipClass}>
                    <span className={styles.chipLabel}>{opt.label}</span>
                    <span
                      className={styles.chipRemove}
                      role="button"
                      aria-label={`${opt.label} 삭제`}
                      onClick={(event) => removeChip(opt.value, event)}
                      onPointerDown={(event) => event.stopPropagation()}>
                      <Icon path={mdiClose} size={CHIP_REMOVE_SIZE[size]} className={styles.chipRemoveIcon} />
                    </span>
                  </span>
                ))}
              </span>
            ) : (
              <span className={valueClass}>{placeholder}</span>
            )
          ) : (
            <span className={valueClass}>{displayValue}</span>
          )}
        </button>

        {open &&
          !disabled &&
          listPos &&
          createPortal(
            <ul
              ref={listRef}
              className={listBoxClass}
              style={{
                top: listPos.top,
                left: listPos.left,
                width: listPos.width,
              }}>
              {options.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <li
                    key={opt.value}
                    className={[optionClass, isSelected && styles.optionSelected, opt.disabled && styles.optionDisabled]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => selectOption(opt)}>
                    {opt.label}
                    {isSelected && <Icon path={mdiCheck} size={ICON_SIZE[size]} className={styles.optionCheck} />}
                  </li>
                );
              })}
            </ul>,
            document.body
          )}
      </div>

      {description && <p className={descriptionClass}>{description}</p>}
    </div>
  );
});
