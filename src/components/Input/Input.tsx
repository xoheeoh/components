import {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  mdiAlertOutline,
  mdiClose,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiInformationOutline,
  mdiPaperclip,
} from "@mdi/js";
import styles from "./Input.module.css";
import { Icon } from "../Icon";

export type InputSize = "sm" | "md" | "lg";
export type InputIconPlacement = "inline-start" | "inline-end";

const ICON_SIZE: Record<InputSize, number> = {
  sm: 18,
  md: 20,
  lg: 24,
};

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** 라벨값. 빈 값인 경우 자동 숨김처리 */
  label?: string;
  error?: boolean;
  size?: InputSize;
  disabled?: boolean;
  readOnly?: boolean;
  align?: "left" | "right";
  /**
   * 우측에 입력 액션 버튼을 표시할지 여부. 최대 1개만 표시됩니다. 기본값 true.
   * - `type="password"`: 보기/숨김 토글
   * - `type="file"`: 파일 선택 시 클리어(X)
   * - 그 외: 값이 있을 때 클리어(X)
   */
  showActionButtons?: boolean;
  /** 필수 여부. 기본값 false */
  required?: boolean;
  /** Input 내부 앞/뒤에 표시할 아이콘 */
  icon?: ReactNode;
  /** 아이콘 위치. 기본값 inline-start */
  iconPlacement?: InputIconPlacement;
  /** 필드 하단 설명란. 존재하는 경우만 표시 */
  description?: ReactNode;
}

function formatFileLabel(files: FileList | null, emptyLabel: string): string {
  if (!files || files.length === 0) return emptyLabel;
  if (files.length === 1) return files[0].name;
  return `${files[0].name} 외 ${files.length - 1}개`;
}

/** 공통 입력 필드 컴포넌트 — Button, Select와 size(height) 동일하게 가져감 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error = false,
    size = "md",
    id,
    className,
    style,
    disabled,
    readOnly,
    align = "left",
    required,
    showActionButtons = true,
    icon,
    iconPlacement = "inline-start",
    description,
    placeholder,
    onChange,
    type,
    value,
    defaultValue,
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const describedBy = [descriptionId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;
  const isFile = type === "file";

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const isPassword = type === "password";
  const [passwordVisible, setPasswordVisible] = useState(false);
  useEffect(() => {
    if (!isPassword) setPasswordVisible(false);
  }, [isPassword]);

  const iconEndVisible = icon != null && iconPlacement === "inline-end";

  const parseHasValue = (v: unknown): boolean => {
    if (v == null) return false;
    if (typeof v === "string") return v.length > 0;
    if (Array.isArray(v)) return v.length > 0;
    // 숫자/그 외 truthy 케이스는 "값이 존재"로 취급
    return true;
  };

  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(() => parseHasValue(defaultValue));
  const hasValue = value != null ? parseHasValue(value) : uncontrolledHasValue;

  const showPasswordToggle = showActionButtons && !disabled && isPassword;
  const showClear = showActionButtons && !disabled && !readOnly && !isPassword && hasValue;
  const actionsVisible = showPasswordToggle || showClear;

  const ACTION_ICON_SIZE: Record<InputSize, number> = { sm: 18, md: 20, lg: 22 };
  const ACTION_BUTTON_WIDTH: Record<InputSize, number> = { sm: 32, md: 40, lg: 48 };
  const ACTION_BUTTON_CLASS: Record<InputSize, string> = {
    sm: styles.actionButtonSm,
    md: styles.actionButtonMd,
    lg: styles.actionButtonLg,
  };

  const actionGroupWidth = actionsVisible ? ACTION_BUTTON_WIDTH[size] : 0;

  const clearIconPath = mdiClose;
  const passwordIconPath = passwordVisible ? mdiEyeOffOutline : mdiEyeOutline;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUncontrolledHasValue(parseHasValue(event.target.value));
    onChange?.(event);
  };

  const handleClear = () => {
    const el = inputRef.current;
    if (!el || disabled || readOnly) return;
    setUncontrolledHasValue(false);
    // React onChange는 `input` 이벤트에 반응하는 경우가 많아서 dispatch로 처리
    el.value = "";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.focus();
  };

  const handleTogglePasswordVisible = () => {
    if (!isPassword) return;
    setPasswordVisible((v) => !v);
    inputRef.current?.focus();
  };

  const emptyFileLabel = placeholder ?? "파일 선택";
  const [fileLabel, setFileLabel] = useState(emptyFileLabel);
  const isFileSelected = fileLabel !== emptyFileLabel;
  const showFileClear = showActionButtons && !disabled && !readOnly && isFileSelected;
  const FILE_CLEAR_BUTTON_WIDTH: Record<InputSize, number> = { sm: 32, md: 40, lg: 48 };

  const fieldClass = [styles.field, className].filter(Boolean).join(" ");
  const labelClass = [styles.label, size === "lg" ? styles.labelLg : size === "md" ? styles.labelMd : styles.labelSm]
    .filter(Boolean)
    .join(" ");
  const descClass = [styles.description, error ? styles.error : ""].filter(Boolean).join(" ");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileLabel(formatFileLabel(event.target.files, emptyFileLabel));
    onChange?.(event);
  };

  const handleFileClear = () => {
    const el = inputRef.current;
    if (!el || disabled || readOnly) return;
    // UI 즉시 반영
    setFileLabel(emptyFileLabel);
    el.value = "";
    // React `onChange`가 파일 input을 감지하도록 change/input 이벤트를 dispatch
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const fileIcon =
    icon != null ? (
      isValidElement(icon) && (icon as ReactElement<{ size?: number }>).props.size == null ? (
        cloneElement(icon as ReactElement<{ size?: number }>, { size: ICON_SIZE[size] })
      ) : (
        icon
      )
    ) : (
      <Icon path={mdiPaperclip} size={ICON_SIZE[size]} />
    );

  const fileControlClass = [
    styles.fileControl,
    styles[size],
    error ? styles.fileControlError : "",
    disabled ? styles.fileControlDisabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  const alignClass = align === "right" ? styles.alignRight : "";

  const inputClass = [
    styles.input,
    styles[size],
    alignClass,
    error ? styles.inputError : "",
    icon && iconPlacement === "inline-start" ? styles.withIconStart : "",
    icon && iconPlacement === "inline-end" ? styles.withIconEnd : "",
  ]
    .filter(Boolean)
    .join(" ");

  const iconClass = [styles.icon, iconPlacement === "inline-start" ? styles.iconStart : styles.iconEnd]
    .filter(Boolean)
    .join(" ");

  const renderedIcon =
    isValidElement(icon) && (icon as ReactElement<{ size?: number }>).props.size == null
      ? cloneElement(icon as ReactElement<{ size?: number }>, { size: ICON_SIZE[size] })
      : icon;

  const resolvedIconSize = (() => {
    if (!isValidElement(icon)) return ICON_SIZE[size];
    const maybeSize = (icon as ReactElement<{ size?: number }>).props.size;
    return maybeSize == null ? ICON_SIZE[size] : maybeSize;
  })();

  const actionGroupRightInset = 4; // .actionButtons의 inset-inline-end
  const actionPaddingInlineEnd = actionsVisible
    ? iconEndVisible
      ? actionGroupRightInset + actionGroupWidth + 12 + resolvedIconSize
      : actionGroupRightInset + actionGroupWidth
    : undefined;

  const mergedInputStyle: CSSProperties | undefined =
    actionPaddingInlineEnd != null ? { ...style, paddingInlineEnd: actionPaddingInlineEnd } : style;

  const iconEndStyle: CSSProperties | undefined =
    actionsVisible && iconEndVisible ? { insetInlineEnd: actionGroupRightInset + actionGroupWidth + 4 } : undefined;

  return (
    <div className={fieldClass}>
      {label && (
        <label className={labelClass} htmlFor={inputId}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      <div className={styles.control}>
        {isFile ? (
          <div
            className={fileControlClass}
            style={showFileClear ? { paddingInlineEnd: FILE_CLEAR_BUTTON_WIDTH[size] + 4 } : undefined}>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              className={styles.fileInputHidden}
              disabled={disabled}
              required={required}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              onChange={handleFileChange}
              {...rest}
            />
            <button
              type="button"
              className={styles.fileTrigger}
              disabled={disabled}
              aria-label="파일 선택"
              onClick={() => inputRef.current?.click()}>
              {fileIcon}
            </button>
            <span
              className={[styles.fileName, fileLabel === emptyFileLabel ? styles.fileNameEmpty : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                if (!disabled) inputRef.current?.click();
              }}>
              {fileLabel}
            </span>
            {showFileClear && (
              <button
                type="button"
                className={styles.fileClearButton}
                disabled={disabled}
                aria-label="파일 선택 취소"
                onClick={handleFileClear}>
                <Icon path={mdiClose} size={ICON_SIZE[size]} />
              </button>
            )}
          </div>
        ) : (
          <>
            {renderedIcon && (
              <span className={iconClass} aria-hidden style={iconEndStyle}>
                {renderedIcon}
              </span>
            )}
            <input
              ref={inputRef}
              id={inputId}
              type={isPassword ? (passwordVisible ? "text" : "password") : type}
              className={inputClass}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              placeholder={placeholder}
              onChange={handleChange}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              value={value}
              defaultValue={defaultValue}
              {...rest}
              style={mergedInputStyle}
            />
            {actionsVisible && (
              <div className={styles.actionButtons}>
                {showClear && (
                  <button
                    type="button"
                    className={[styles.actionButton, ACTION_BUTTON_CLASS[size]].filter(Boolean).join(" ")}
                    disabled={disabled}
                    aria-label="입력 지우기"
                    onClick={handleClear}>
                    <Icon path={clearIconPath} size={ACTION_ICON_SIZE[size]} />
                  </button>
                )}
                {showPasswordToggle && (
                  <button
                    type="button"
                    className={[styles.actionButton, ACTION_BUTTON_CLASS[size]].filter(Boolean).join(" ")}
                    disabled={disabled}
                    aria-label={passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                    onClick={handleTogglePasswordVisible}>
                    <Icon path={passwordIconPath} size={ACTION_ICON_SIZE[size]} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {description && (
        <p id={descriptionId} className={descClass} role={error ? "alert" : undefined}>
          {error ? (
            <Icon path={mdiAlertOutline} size={15} style={{ marginBottom: 1 }} />
          ) : (
            <Icon path={mdiInformationOutline} size={15} style={{ marginBottom: 1 }} />
          )}
          {description}
        </p>
      )}
    </div>
  );
});
