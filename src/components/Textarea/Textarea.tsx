import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
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
  /** 라벨값. 빈 값인 경우 자동 숨김처리 */
  label?: string;
  /** 입력 필드 상태값. (예: error 발생 시 negative 사용) */
  status?: TextareaStatus;
  /** 상태값에 따른 뱃지. status가 default인 경우엔 보이지 않음 */
  statusBadge?: boolean;
  size?: TextareaSize;
  /** 필수 입력 필드 여부 */
  required?: boolean;
  /** 도움말 텍스트 */
  description?: string;
  disabled?: boolean;
  placeholder?: string;
  /** 영역 크기 동작. resizable이면 입력에 따라 높이가 늘어남
   * fixed의 경우 높이값이 고정되며, fixedHeight와 함께 사용해야 함
   */
  resize?: TextareaResize;
  fixedHeight?: number;
  /** 최대 글자 수 카운트 표시 여부. maxLength와 함께 사용해야 0 / maxLength 형태로 표시됨 */
  characterCount?: boolean;
  maxLength?: number;
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
    ...rest
  },
  ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

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
  const textareaClass = [styles.textarea, styles[size], styles[status], styles[resize], showFooter && styles.hasFooter]
    .filter(Boolean)
    .join(" ");
  const descriptionClass = [styles.description, styles[status]].filter(Boolean).join(" ");
  const bottomClass = [styles.bottom, styles[size]].filter(Boolean).join(" ");
  const badgeClass = [styles.statusBadge, styles[size], styles[status]].filter(Boolean).join(" ");

  return (
    <div className={styles.field}>
      {label && (
        <span className={labelClass}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </span>
      )}

      <div className={styles.control}>
        <textarea
          ref={textareaRef}
          className={textareaClass}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          {...rest}
          maxLength={maxLength}
          style={{
            ...style,
            ...(resize === "fixed" && fixedHeight != null ? { height: fixedHeight } : undefined),
          }}
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
              <div className={badgeClass}>
                <Icon path={status === "positive" ? mdiCheckCircle : mdiAlertCircle} size={ICON_SIZE[size]} />
              </div>
            )}
          </div>
        )}
      </div>

      {description && <p className={descriptionClass}>{description}</p>}
    </div>
  );
});
