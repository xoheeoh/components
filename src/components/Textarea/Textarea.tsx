import {
  forwardRef,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type TextareaHTMLAttributes,
} from "react";
import styles from "./Textarea.module.css";
import { Icon } from "../Icon";
import { mdiAlertCircle, mdiCheckCircle } from "@mdi/js";

export type TextareaStatus = "default" | "positive" | "negative";
export type TextareaResize = "fixed" | "resizable";
export type TextareaSize = "sm" | "md" | "lg";

const ICON_SIZE: Record<TextareaSize, number> = {
  sm: 18,
  md: 20,
  lg: 24,
};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 라벨값. 빈 값이면 자동으로 숨긴다. */
  label?: string;
  /** 입력 필드 상태값. (예: error 발생 시 negative 사용) */
  status?: TextareaStatus;
  /** 상태값에 따른 뱃지. status가 default면 보이지 않는다. */
  statusBadge?: boolean;
  size?: TextareaSize;
  /** 필수 입력 필드 여부 */
  required?: boolean;
  /** 도움말 텍스트 */
  description?: string;
  disabled?: boolean;
  placeholder?: string;
  /** 영역 크기 동작. resizable이면 입력에 따라 높이가 늘어난다.
   * fixed면 높이가 고정되며, fixedHeight와 함께 써야 한다.
   */
  resize?: TextareaResize;
  fixedHeight?: number;
  /** 최대 글자 수 카운트 표시 여부. maxLength와 함께 써야 0 / maxLength 형태로 표시된다. */
  characterCount?: boolean;
  maxLength?: number;
  /** inline style. 예: `{ width: 200 }` */
  style?: CSSProperties;
  className?: string;
}

function syncTextareaHeight(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  const { borderTopWidth, borderBottomWidth } = getComputedStyle(el);
  el.style.height = `${el.scrollHeight + parseFloat(borderTopWidth) + parseFloat(borderBottomWidth)}px`;
}

function getValueLength(value: unknown): number {
  if (value == null) return 0;
  return String(value).length;
}

/** 긴 텍스트용 공통 입력 필드 컴포넌트 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    status = "default",
    statusBadge = true,
    size = "md",
    required = false,
    description,
    disabled = false,
    placeholder,
    resize = "resizable",
    fixedHeight,
    characterCount = false,
    maxLength,
    value,
    defaultValue,
    onChange,
    style,
    className,
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...rest
  },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  // 소비자가 id를 넘기면 그것을 쓰고, 없으면 인스턴스별로 고유한 값을 만든다.
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const descriptionId = `${textareaId}-description`;

  // 소비자가 넘긴 aria-describedby를 덮지 않고 뒤에 이어 붙인다.
  const describedBy =
    [description ? descriptionId : null, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  /**
   * 접근성 속성.
   * {...rest}보다 앞에 펼쳐서, 소비자가 명시한 값이 이기도록 한다.
   */
  const a11yProps = {
    id: textareaId,
    required: required || undefined,
    "aria-required": required || undefined,
    "aria-describedby": describedBy,
    "aria-invalid": ariaInvalid ?? (status === "negative" ? true : undefined),
  };

  const [uncontrolledLength, setUncontrolledLength] = useState(() => getValueLength(defaultValue));
  const length = value != null ? getValueLength(value) : uncontrolledLength;

  const isAutoGrow = resize === "resizable";
  const showBadge = statusBadge && status !== "default" && !disabled;
  const showFooter = showBadge || characterCount;

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (isAutoGrow) {
      syncTextareaHeight(el);
      return;
    }
    el.style.height = fixedHeight != null ? `${fixedHeight}px` : "";
  });

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (value == null) setUncontrolledLength(event.currentTarget.value.length);
    if (isAutoGrow) syncTextareaHeight(event.currentTarget);
    onChange?.(event);
  };

  const labelClass = [styles.label, styles[size]].filter(Boolean).join(" ");
  const textareaClass = [
    styles.textarea,
    styles[size],
    styles[status],
    styles[resize],
    showFooter && styles.hasFooter,
  ]
    .filter(Boolean)
    .join(" ");
  const descriptionClass = [styles.description, styles[status]].filter(Boolean).join(" ");
  const bottomClass = [styles.bottom, styles[size]].filter(Boolean).join(" ");
  const badgeClass = [styles.statusBadge, styles[size], styles[status]].filter(Boolean).join(" ");

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")} style={style}>
      {label && (
        <label className={labelClass} htmlFor={textareaId}>
          {label}
          {/* 필수 여부는 aria-required가 전달하므로 별표는 읽히지 않게 한다. */}
          {required && (
            <span className={styles.required} aria-hidden>
              *
            </span>
          )}
        </label>
      )}

      <div className={styles.control}>
        <textarea
          ref={textareaRef}
          className={textareaClass}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          {...a11yProps}
          {...rest}
          maxLength={maxLength}
          style={resize === "fixed" && fixedHeight != null ? { height: fixedHeight } : undefined}
          onChange={handleChange}
        />

        {showFooter && (
          <div className={bottomClass}>
            {characterCount && (
              <span className={styles.characterCount}>
                {length}
                {maxLength != null ? `/${maxLength}` : ""}
              </span>
            )}

            {showBadge && (
              // 텍스트 대안이 없는 장식이다. 상태의 의미는 aria-invalid와 description이 전달한다.
              <div className={badgeClass} aria-hidden>
                <Icon
                  path={status === "positive" ? mdiCheckCircle : mdiAlertCircle}
                  size={ICON_SIZE[size]}
                />
              </div>
            )}
          </div>
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
