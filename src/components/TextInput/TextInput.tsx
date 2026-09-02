import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type HTMLInputTypeAttribute,
  type InputHTMLAttributes,
} from "react";
import styles from "./TextInput.module.css";
import { Icon } from "../Icon";
import {
  mdiAlertCircle,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiMagnify,
  mdiPaperclip,
} from "@mdi/js";

export type TextInputStatus = "default" | "positive" | "negative";
export type TextInputSize = "sm" | "md" | "lg";

type TrailingSlot = "password" | "status" | "clear" | null;

const ICON_SIZE: Record<TextInputSize, number> = {
  sm: 18,
  md: 20,
  lg: 24,
};

function parseHasValue(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.length > 0;
  return true;
}

function resolveTrailingSlot({
  isPassword,
  showBadge,
  canClear,
}: {
  isPassword: boolean;
  showBadge: boolean;
  canClear: boolean;
}): TrailingSlot {
  if (isPassword) return "password";
  if (showBadge) return "status";
  if (canClear) return "clear";
  return null;
}

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** 라벨값. 빈 값인 경우 자동 숨김처리 */
  label?: string;
  /** 입력 필드 상태값. (예: error 발생 시 negative 사용) */
  status?: TextInputStatus;
  /** 상태값에 따른 뱃지. status가 default인 경우엔 보이지 않음 */
  statusBadge?: boolean;
  size?: TextInputSize;
  /** 필수 입력 필드 여부 */
  required?: boolean;
  /** 도움말 텍스트 */
  description?: string;
  disabled?: boolean;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
}

/** 짧은 텍스트용 공통 입력 필드 컴포넌트 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    label,
    status = "default",
    statusBadge = true,
    size = "md",
    required = false,
    description,
    disabled = false,
    readOnly,
    type = "text",
    placeholder,
    value,
    defaultValue,
    onChange,
    ...rest
  },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const isFile = type === "file";
  const isPassword = type === "password";
  const emptyFileLabel = placeholder ?? "파일을 선택하세요.";
  const [fileLabel, setFileLabel] = useState(emptyFileLabel);
  const [pwVisible, setPwVisible] = useState(false);
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(() => parseHasValue(defaultValue));
  const hasValue = value != null ? parseHasValue(value) : uncontrolledHasValue;

  const showBadge = statusBadge && status !== "default" && !disabled;
  const canClear = !disabled && !readOnly && (isFile ? fileLabel !== emptyFileLabel : hasValue);
  const trailing = resolveTrailingSlot({ isPassword, showBadge, canClear });

  const labelClass = [styles.label, styles[size]].filter(Boolean).join(" ");
  const inputClass = [styles.input, styles[size], styles[status]].filter(Boolean).join(" ");
  const descriptionClass = [styles.description, styles[status]].filter(Boolean).join(" ");
  const iconClass = [styles.icon, styles[size]].filter(Boolean).join(" ");
  const fileTriggerClass = [styles.fileTrigger, styles[size]].filter(Boolean).join(" ");
  const trailingBadgeClass = [styles.trailing, styles.statusBadge, styles[size], styles[status]]
    .filter(Boolean)
    .join(" ");
  const trailingButtonClass = [styles.trailing, styles.actionButton, styles[size]].filter(Boolean).join(" ");
  const trailingClearClass = [styles.trailing, styles.actionButton, styles.clearButton, styles[size]]
    .filter(Boolean)
    .join(" ");

  const openFilePicker = () => {
    if (disabled || readOnly) return;
    inputRef.current?.click();
  };

  const handleTogglePwVisible = () => {
    setPwVisible((v) => !v);
    inputRef.current?.focus();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isFile) {
      const files = event.target.files;
      setFileLabel(
        !files?.length
          ? emptyFileLabel
          : files.length === 1
          ? files[0].name
          : `${files[0].name} 외 ${files.length - 1}개`
      );
    } else {
      setUncontrolledHasValue(parseHasValue(event.target.value));
    }
    onChange?.(event);
  };

  const handleClear = () => {
    const el = inputRef.current;
    if (!el || disabled || readOnly) return;
    if (isFile) {
      setFileLabel(emptyFileLabel);
      el.value = "";
    } else {
      setUncontrolledHasValue(false);
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setter?.call(el, "");
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    if (!isFile) el.focus();
  };

  const trailingControl =
    trailing === "password" ? (
      <button
        type="button"
        className={trailingButtonClass}
        disabled={disabled}
        aria-label={pwVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
        onClick={handleTogglePwVisible}>
        <Icon path={pwVisible ? mdiEyeOffOutline : mdiEyeOutline} size={ICON_SIZE[size]} />
      </button>
    ) : trailing === "status" ? (
      <div className={trailingBadgeClass}>
        <Icon path={status === "positive" ? mdiCheckCircle : mdiAlertCircle} size={ICON_SIZE[size]} />
      </div>
    ) : trailing === "clear" ? (
      <button type="button" className={trailingClearClass} aria-label="입력 지우기" onClick={handleClear}>
        <Icon path={mdiCloseCircle} size={ICON_SIZE[size]} />
      </button>
    ) : null;

  return (
    <div className={styles.field}>
      {label && (
        <span className={labelClass}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </span>
      )}

      <div className={styles.control}>
        {isFile ? (
          <>
            <input
              ref={inputRef}
              type="file"
              className={styles.fileInputHidden}
              disabled={disabled}
              required={required}
              {...rest}
              onChange={handleChange}
            />
            <div className={[inputClass, styles.fileField].join(" ")} onClick={openFilePicker} aria-hidden>
              <span className={fileLabel === emptyFileLabel ? styles.fileNameEmpty : undefined}>{fileLabel}</span>
            </div>
            <button
              type="button"
              className={fileTriggerClass}
              disabled={disabled}
              aria-label="파일 선택"
              onClick={openFilePicker}>
              <Icon path={mdiPaperclip} size={ICON_SIZE[size]} />
            </button>
          </>
        ) : (
          <>
            <input
              ref={inputRef}
              type={isPassword ? (pwVisible ? "text" : "password") : type}
              {...rest}
              value={value}
              defaultValue={defaultValue}
              placeholder={placeholder}
              required={required}
              className={inputClass}
              disabled={disabled}
              readOnly={readOnly}
              onChange={handleChange}
            />
            {type === "search" && (
              <div className={iconClass} aria-hidden>
                <Icon path={mdiMagnify} size={ICON_SIZE[size]} />
              </div>
            )}
          </>
        )}
        {trailingControl}
      </div>

      {description && <p className={descriptionClass}>{description}</p>}
    </div>
  );
});
