import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
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

/**
 * 트리거는 <div role="combobox">다. <button>은 children presentational이라
 * 칩 삭제 버튼을 안에 넣으면 의미가 무시되기 때문이다 (ARIA APG select-only combobox 구조).
 *
 * className·style·defaultValue는 트리거가 아닌 다른 대상에 쓰이므로 제외하고 아래에서 다시 선언한다.
 * 나머지 속성은 {...rest}로 트리거에 전달된다.
 */
type SelectBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "value" | "defaultValue" | "onClick" | "className" | "style"
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
  /** 필드 wrapper에 적용되는 inline style. 예: `{ width: 200 }` */
  style?: CSSProperties;
  /** 필드 wrapper에 적용되는 className */
  className?: string;
};

export interface SelectSingleProps extends SelectBaseProps {
  /** 단일 선택은 text만 사용. chip을 넘겨도 텍스트로 표시됨 */
  type?: "text";
  multiple?: false;
  /**
   * 선택된 옵션 value (제어 모드).
   * 넘기면 부모가 상태를 관리하며, onValueChange로 갱신해야 값이 바뀐다.
   */
  value?: string;
  /** 초기 선택값 (비제어 모드). 이후 선택은 컴포넌트가 내부에서 기억한다. value와 함께 쓰지 않는다. */
  defaultValue?: string;
  /** 옵션 선택 시 호출. 부모 state를 갱신할 때 사용 */
  onValueChange?: (value: string) => void;
}

export type SelectMultipleProps = SelectBaseProps & {
  /**
   * 선택된 옵션 value 목록 (제어 모드).
   * 넘기면 부모가 상태를 관리하며, onValueChange로 갱신해야 값이 바뀐다.
   */
  value?: string[];
  /** 초기 선택값 목록 (비제어 모드). value와 함께 쓰지 않는다. */
  defaultValue?: string[];
  /** 옵션 선택/해제 시 호출 */
  onValueChange?: (value: string[]) => void;
} & ({ type?: "text"; multiple: true } | { type: "chip"; multiple?: true });

export type SelectProps = SelectSingleProps | SelectMultipleProps;

function selectedValuesOf(multiple: boolean, value: string | string[] | undefined): string[] {
  if (multiple) return Array.isArray(value) ? value : [];
  return typeof value === "string" && value !== "" ? [value] : [];
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(
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
    defaultValue,
    onValueChange,
    style,
    className,
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  },
  ref,
) {
  const isChip = type === "chip";
  const isMultiple = multiple || isChip;
  const labelClass = [styles.label, styles[size]].filter(Boolean).join(" ");
  const triggerClass = [
    styles.select,
    styles[size],
    styles[status],
    overflow && styles.selectOverflow,
  ]
    .filter(Boolean)
    .join(" ");
  const descriptionClass = [styles.description, styles[status]].filter(Boolean).join(" ");

  // 상태 뱃지
  const showBadge = statusBadge && status !== "default" && !disabled;
  const statusBadgeClass = [styles.statusBadge, styles[size], styles[status]]
    .filter(Boolean)
    .join(" ");
  const statusBadgeIcon = showBadge ? (
    // 텍스트 대안이 없는 장식이다. 상태의 의미는 aria-invalid와 description이 전달한다.
    <span className={statusBadgeClass} aria-hidden>
      <Icon path={status === "positive" ? mdiCheckCircle : mdiAlertCircle} size={ICON_SIZE[size]} />
    </span>
  ) : null;

  // 옵션 리스트 관련
  const triggerRef = useRef<HTMLDivElement | null>(null); // 리스트 위치용
  const listRef = useRef<HTMLUListElement>(null);

  /**
   * 내부 위치 계산용 ref와 외부로 전달된 ref를 동시에 채운다.
   * useImperativeHandle + non-null 캐스트를 쓰면 마운트 전/언마운트 후의 null을
   * 타입에서 숨기게 되므로, 콜백 ref로 실제 노드를 그대로 넘긴다.
   */
  const setTriggerRef = useCallback(
    (node: HTMLDivElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const [open, setOpen] = useState(false);
  const [listPos, setListPos] = useState<{ top: number; left: number; width: number }>();
  const listBoxClass = [styles.listbox, styles[size]].filter(Boolean).join(" ");

  /** aria-activedescendant로 표현되는 활성 옵션. 옵션은 포커스를 받지 않는다. */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // typeahead 버퍼. 마지막 입력 후 500ms가 지나면 초기화한다.
  const searchRef = useRef("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /**
   * value를 넘기면 제어 모드, 없으면 defaultValue로 시작해 내부에서 기억한다.
   * Radio·Checkbox·TextInput과 같은 판별 방식.
   */
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | string[]>(
    () => defaultValue ?? (isMultiple ? [] : ""),
  );
  const currentValue = isControlled ? value : uncontrolledValue;
  const selectedValues = selectedValuesOf(isMultiple, currentValue);

  /** 비제어 모드일 때만 내부 상태를 갱신하고, 콜백은 두 모드 모두에서 호출한다. */
  const commitValue = (next: string | string[]) => {
    if (!isControlled) setUncontrolledValue(next);
  };

  useLayoutEffect(() => {
    if (!open) {
      setListPos(undefined);
      return;
    }

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const next = {
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      };
      // scroll 리스너가 capture라서 목록 내부 스크롤(활성 옵션 scrollIntoView)도 이 콜백을
      // 재실행한다. 값이 같으면 새 객체를 만들지 않아 불필요한 리렌더를 막는다.
      setListPos((prev) =>
        prev && prev.top === next.top && prev.left === next.left && prev.width === next.width
          ? prev
          : next,
      );
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  // 리스트 바깥 상호작용으로 닫기
  useEffect(() => {
    if (!open) return;

    const isInside = (target: Node) =>
      Boolean(triggerRef.current?.contains(target) || listRef.current?.contains(target));

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (isInside(target)) return;
      setOpen(false);
      setActiveIndex(null);
      // 클릭 대상이 포커스를 가져가지 않았을 때만 트리거로 되돌린다.
      // 사용자가 다른 입력을 클릭했다면 포커스를 훔치지 않는다.
      window.requestAnimationFrame(() => {
        if (document.activeElement === document.body) triggerRef.current?.focus();
      });
    };

    // pointerdown만으로는 키보드 포커스 이동으로 목록이 닫히지 않는다.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (!target || isInside(target)) return;
      setOpen(false);
      setActiveIndex(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open]);

  // 언마운트 시 typeahead 타이머 정리
  useEffect(() => () => clearTimeout(searchTimerRef.current), []);

  // ===== 활성 옵션 이동 =====
  const normalizeIndex = (index: number) => (index >= 0 ? index : null);
  const firstEnabledIndex = () => options.findIndex((opt) => !opt.disabled);
  const lastEnabledIndex = () => {
    for (let i = options.length - 1; i >= 0; i -= 1) if (!options[i].disabled) return i;
    return -1;
  };
  /** from에서 step 방향의 다음 enabled 옵션. 양끝에서는 제자리 유지 (native select처럼 wrap 없음). */
  const nextEnabledIndex = (from: number | null, step: number) => {
    const start = from ?? (step > 0 ? -1 : options.length);
    for (let i = start + step; i >= 0 && i < options.length; i += step) {
      if (!options[i].disabled) return i;
    }
    return from;
  };

  const closeList = (restoreFocus: boolean) => {
    setOpen(false);
    setActiveIndex(null);
    searchRef.current = "";
    if (restoreFocus) triggerRef.current?.focus();
  };

  /** 키보드로 열었을 때의 기본 활성 항목 — 선택된 옵션, 없으면 첫 enabled 옵션. */
  const initialActiveIndex = () => {
    const selected = options.findIndex(
      (opt) => !opt.disabled && selectedValues.includes(opt.value),
    );
    return normalizeIndex(selected >= 0 ? selected : firstEnabledIndex());
  };

  /**
   * initial="none"은 활성 항목을 만들지 않는다 (마우스로 열 때).
   * 활성 표시는 키보드 조작의 산물이므로, 마우스로 열었을 때 링이 보이면 안 된다.
   */
  const openList = (initial: "selected" | "first" | "last" | "none" = "selected") => {
    if (disabled) return;
    setOpen(true);
    if (initial === "none") return setActiveIndex(null);
    if (initial === "first") return setActiveIndex(normalizeIndex(firstEnabledIndex()));
    if (initial === "last") return setActiveIndex(normalizeIndex(lastEnabledIndex()));
    setActiveIndex(initialActiveIndex());
  };

  const selectOption = (opt: SelectOption) => {
    if (opt.disabled || disabled) return;

    if (isMultiple) {
      const next = selectedValues.includes(opt.value)
        ? selectedValues.filter((item) => item !== opt.value)
        : [...selectedValues, opt.value];
      commitValue(next);
      (onValueChange as SelectMultipleProps["onValueChange"])?.(next);
      // multiple은 목록을 열어둔다. 마우스 동작과 동일하며, N개를 고르려고 N번 열지 않게 한다.
      return;
    }

    commitValue(opt.value);
    (onValueChange as SelectSingleProps["onValueChange"])?.(opt.value);
    // 마우스로 <li>를 클릭하면 포커스가 body로 빠지므로 트리거로 되돌린다.
    closeList(true);
  };

  const removeChip = (item: string, event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || !isMultiple) return;
    const next = selectedValues.filter((valueItem) => valueItem !== item);
    commitValue(next);
    (onValueChange as SelectMultipleProps["onValueChange"])?.(next);
  };

  const selectedOptions = selectedValues
    .map((item) => options.find((opt) => opt.value === item))
    .filter((opt): opt is SelectOption => opt != null);
  const hasValue = selectedOptions.length > 0;
  const displayValue = hasValue ? selectedOptions.map((opt) => opt.label).join(", ") : placeholder;
  const valueClass = [
    styles.value,
    styles[size],
    !hasValue && styles.placeholder,
    overflow && styles.valueOverflow,
  ]
    .filter(Boolean)
    .join(" ");
  const chipsClass = [styles.chips, styles[size], overflow && styles.chipsOverflow]
    .filter(Boolean)
    .join(" ");
  const chipClass = [styles.chip, styles[size]].filter(Boolean).join(" ");
  const optionClass = [styles.option, styles[size]].filter(Boolean).join(" ");

  // 소비자가 id를 넘기면 그것을 쓰고, 없으면 인스턴스별로 고유한 값을 만든다.
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const labelId = `${triggerId}-label`;
  const valueId = `${triggerId}-value`;
  const descriptionId = `${triggerId}-description`;
  const listboxId = `${triggerId}-listbox`;
  const chipLabelId = (optionValue: string) => `${triggerId}-chip-${optionValue}`;
  const optionId = (optionValue: string) => `${triggerId}-option-${optionValue}`;

  // 소비자가 넘긴 aria-describedby를 덮지 않고 뒤에 이어 붙인다.
  const describedBy =
    [description ? descriptionId : null, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  /**
   * 트리거가 <button>이라 <label htmlFor>만으로는 접근 가능한 이름이 만들어지지 않는다.
   * button의 이름은 내용(= 선택값)에서 나오므로, 필드명과 선택값을 함께 읽히게 하려면
   * aria-labelledby로 직접 엮어야 한다.
   *
   * chip 표시일 때는 칩 라벨만 참조한다. 칩 컨테이너를 참조하면 삭제 컨트롤의
   * aria-label("사과 삭제")까지 이름에 섞인다.
   */
  const showsChips = isChip && isMultiple && hasValue;
  const valueRefIds = showsChips ? selectedOptions.map((opt) => chipLabelId(opt.value)) : [valueId];

  /**
   * role="combobox"는 Name From: author라서 <button>과 달리 내용에서 이름이 만들어지지 않는다.
   * label이 없을 때 그냥 비워두면 접근 가능한 이름이 아예 없어지므로,
   * 소비자가 준 이름이 없을 때만 선택값을 이름으로 삼는다.
   */
  const labelledBy = label
    ? [labelId, ...valueRefIds].join(" ")
    : ariaLabel != null || ariaLabelledBy != null
      ? undefined
      : valueRefIds.join(" ");

  /**
   * 접근성 속성.
   * {...rest}보다 앞에 펼쳐서, 소비자가 명시한 값이 이기도록 한다.
   * <button>에는 native required가 없어 aria-required만 설정한다.
   */
  const a11yProps = {
    id: triggerId,
    "aria-label": ariaLabel,
    "aria-labelledby": labelledBy,
    "aria-required": required || undefined,
    "aria-describedby": describedBy,
    "aria-invalid": ariaInvalid ?? (status === "negative" ? true : undefined),
  };

  const activeOption = activeIndex == null ? undefined : options[activeIndex];

  // 활성 옵션이 뷰포트 밖이면 보이게 한다 (.listbox는 max-height 240px + overflow-y: auto).
  useEffect(() => {
    if (!open || !activeOption) return;
    listRef.current
      ?.querySelector<HTMLLIElement>(`#${CSS.escape(optionId(activeOption.value))}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeOption?.value]);

  const runTypeahead = (char: string) => {
    clearTimeout(searchTimerRef.current);
    searchRef.current += char.toLocaleLowerCase();
    searchTimerRef.current = setTimeout(() => {
      searchRef.current = "";
    }, 500);

    const query = searchRef.current;
    const found = options.findIndex(
      (opt) => !opt.disabled && opt.label.toLocaleLowerCase().startsWith(query),
    );
    if (found !== -1) setActiveIndex(found);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // 칩 삭제 버튼에서 버블링된 키는 트리거가 처리하지 않는다.
    if (event.target !== event.currentTarget || disabled) return;

    const { key } = event;

    if (key === "Escape") {
      if (!open) return;
      // Dialog가 event.defaultPrevented로 "안쪽 팝오버가 소비했는지"를 판단하므로,
      // preventDefault를 호출해야 감싸는 Dialog까지 닫히지 않는다.
      event.preventDefault();
      closeList(true);
      return;
    }

    if (key === "Tab") {
      // preventDefault를 하지 않아 포커스는 자연스럽게 다음 요소로 이동한다.
      if (open) closeList(false);
      return;
    }

    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      if (!open) return openList();
      // 마우스로 열어 활성 항목이 없는 상태라면, 키보드로 열었을 때와 같은 지점에서 시작한다.
      if (activeIndex == null) return setActiveIndex(initialActiveIndex());
      setActiveIndex((prev) => nextEnabledIndex(prev, key === "ArrowDown" ? 1 : -1));
      return;
    }

    if (key === "Home" || key === "End") {
      event.preventDefault();
      if (!open) return openList(key === "Home" ? "first" : "last");
      setActiveIndex(normalizeIndex(key === "Home" ? firstEnabledIndex() : lastEnabledIndex()));
      return;
    }

    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (!open) return openList();
      if (activeOption) selectOption(activeOption);
      return;
    }

    // IME 조합 중에는 key가 "Process"라 length !== 1로 걸러진다.
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (!open) openList();
      runTypeahead(key);
    }
  };

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")} style={style}>
      {label && (
        <label className={labelClass} id={labelId} htmlFor={triggerId}>
          {label}
          {/* 필수 여부는 aria-required가 전달하므로 별표는 읽히지 않게 한다 */}
          {required && (
            <span className={styles.required} aria-hidden>
              *
            </span>
          )}
        </label>
      )}

      <div className={styles.control}>
        <div
          ref={setTriggerRef}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={open && activeOption ? optionId(activeOption.value) : undefined}
          aria-disabled={disabled || undefined}
          className={triggerClass}
          {...a11yProps}
          {...rest}
          onKeyDown={handleTriggerKeyDown}
          onClick={() => {
            if (disabled) return;
            // <div>는 Enter/Space로 click을 발생시키지 않고 그 키는 onKeyDown이 처리하므로
            // 이 핸들러는 마우스·터치 전용이다. 활성 항목을 만들지 않는다.
            if (open) closeList(false);
            else openList("none");
          }}
        >
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
                    <span className={styles.chipLabel} id={chipLabelId(opt.value)}>
                      {opt.label}
                    </span>
                    <button
                      type="button"
                      className={styles.chipRemove}
                      disabled={disabled}
                      aria-label={`${opt.label} 삭제`}
                      onClick={(event) => removeChip(opt.value, event)}
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      <Icon
                        path={mdiClose}
                        size={CHIP_REMOVE_SIZE[size]}
                        className={styles.chipRemoveIcon}
                      />
                    </button>
                  </span>
                ))}
              </span>
            ) : (
              <span className={valueClass} id={valueId}>
                {placeholder}
              </span>
            )
          ) : (
            <span className={valueClass} id={valueId}>
              {displayValue}
            </span>
          )}
        </div>

        {open &&
          !disabled &&
          listPos &&
          createPortal(
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-multiselectable={isMultiple || undefined}
              aria-labelledby={label ? labelId : undefined}
              className={listBoxClass}
              style={{
                top: listPos.top,
                left: listPos.left,
                width: listPos.width,
              }}
            >
              {options.map((opt, index) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <li
                    key={opt.value}
                    id={optionId(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    className={[
                      optionClass,
                      isSelected && styles.optionSelected,
                      opt.disabled && styles.optionDisabled,
                      index === activeIndex && styles.optionActive,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => selectOption(opt)}
                  >
                    {opt.label}
                    {isSelected && (
                      <Icon path={mdiCheck} size={ICON_SIZE[size]} className={styles.optionCheck} />
                    )}
                  </li>
                );
              })}
            </ul>,
            document.body,
          )}
      </div>

      {description && (
        <p id={descriptionId} className={descriptionClass}>
          {description}
        </p>
      )}
    </div>
  );
});
