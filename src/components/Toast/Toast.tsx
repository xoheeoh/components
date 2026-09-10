import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { mdiAlert, mdiAlertCircle, mdiCheckCircle, mdiInformation } from "@mdi/js";
import { Icon } from "../Icon";
import styles from "./Toast.module.css";

export type ToastType = "default" | "success" | "info" | "warning" | "error";
/** 등장 위치. bottom이면 아래에서 위로, top이면 위에서 아래로 */
export type ToastPosition = "bottom" | "top";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** 표시할 메시지 */
  message: string;
  /** default는 아이콘 없음. 그 외 타입은 아이콘 표시. 기본값 default */
  type?: ToastType;
  /** 자동 닫힘 시간(ms). 0이면 dismiss로만 닫힘. 액션이 있으면 기본값 6000, 없으면 3000 */
  duration?: number;
  /** 오른쪽 액션 버튼. 있으면 호버/포커스 중에는 시간이 끝나도 닫히지 않음 */
  action?: ToastAction;
}

interface ToastItemData extends Required<Pick<ToastOptions, "message" | "type" | "duration">> {
  id: string;
  exiting?: boolean;
  action?: ToastAction;
}

interface HoldState {
  holds: number;
  overdue: boolean;
}

type ToastTypedShowFn = (
  message: string,
  options?: Omit<ToastOptions, "message" | "type">,
) => string;

export interface ToastApi {
  /** 메시지 표시. type 기본값 default(아이콘 없음) */
  (message: string, options?: Omit<ToastOptions, "message">): string;
  success: ToastTypedShowFn;
  info: ToastTypedShowFn;
  warning: ToastTypedShowFn;
  error: ToastTypedShowFn;
  /** id 지정 시 해당 토스트만, 없으면 전체 닫기 */
  dismiss: (id?: string) => void;
}

interface ToastContextValue {
  toast: ToastApi;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICON_BY_TYPE: Record<Exclude<ToastType, "default">, string> = {
  success: mdiCheckCircle,
  info: mdiInformation,
  warning: mdiAlert,
  error: mdiAlertCircle,
};

const ICON_CLASS_BY_TYPE: Record<Exclude<ToastType, "default">, string> = {
  success: styles.iconSuccess,
  info: styles.iconInfo,
  warning: styles.iconWarning,
  error: styles.iconError,
};

const DEFAULT_DURATION = 3000;
const ACTION_DURATION = 6000;
const EXIT_MS = 220;

export interface ToastProps {
  message: string;
  type?: ToastType;
  /** 등장 방향. 기본값 top */
  position?: ToastPosition;
  exiting?: boolean;
  onExitComplete?: () => void;
  action?: ToastAction;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
  onAction?: () => void;
}

/** 단일 토스트 UI — 보통 ToastProvider + useToast로 사용 */
export function Toast({
  message,
  type = "default",
  position = "top",
  exiting = false,
  onExitComplete,
  action,
  onHoldStart,
  onHoldEnd,
  onAction,
}: ToastProps) {
  const motionClass = exiting
    ? position === "top"
      ? styles.exitTop
      : styles.exitBottom
    : position === "top"
      ? styles.enterTop
      : styles.enterBottom;

  const toastClass = [styles.toast, type !== "default" && styles[type], motionClass]
    .filter(Boolean)
    .join(" ");
  const showIcon = type !== "default";
  const pauseOnInteract = Boolean(action && onHoldStart && onHoldEnd);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!pauseOnInteract) return;
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    onHoldEnd?.();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={toastClass}
      onMouseEnter={pauseOnInteract ? onHoldStart : undefined}
      onMouseLeave={pauseOnInteract ? onHoldEnd : undefined}
      onFocus={pauseOnInteract ? onHoldStart : undefined}
      onBlur={pauseOnInteract ? handleBlur : undefined}
      onAnimationEnd={() => {
        if (exiting) onExitComplete?.();
      }}
    >
      {showIcon && (
        <Icon
          path={ICON_BY_TYPE[type]}
          size={20}
          className={[styles.icon, ICON_CLASS_BY_TYPE[type]].join(" ")}
        />
      )}
      <p className={styles.message}>{message}</p>
      {action ? (
        <button
          type="button"
          className={styles.action}
          disabled={exiting}
          onClick={() => {
            action.onClick();
            onAction?.();
          }}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

export interface ToastProviderProps {
  children?: ReactNode;
  /** 기본 자동 닫힘 시간(ms). 개별 toast 호출에서 덮어쓸 수 있음 */
  defaultDuration?: number;
  /** 토스트 등장 위치. 기본값 top */
  position?: ToastPosition;
}

export function ToastProvider({
  children,
  defaultDuration = DEFAULT_DURATION,
  position = "top",
}: ToastProviderProps) {
  const [items, setItems] = useState<ToastItemData[]>([]);
  const itemsRef = useRef(items);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const holdRef = useRef<Map<string, HoldState>>(new Map());
  const idPrefix = useId();
  const seqRef = useRef(0);

  itemsRef.current = items;

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const remove = useCallback(
    (id: string) => {
      clearTimer(id);
      holdRef.current.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [clearTimer],
  );

  const beginExit = useCallback(
    (id: string) => {
      clearTimer(id);
      holdRef.current.delete(id);
      setItems((prev) => {
        const target = prev.find((item) => item.id === id);
        if (!target || target.exiting) return prev;
        return prev.map((item) => (item.id === id ? { ...item, exiting: true } : item));
      });
      // animationend 미수신 대비
      const fallback = setTimeout(() => remove(id), EXIT_MS + 50);
      timersRef.current.set(id, fallback);
    },
    [clearTimer, remove],
  );

  const tryClose = useCallback(
    (id: string) => {
      const hold = holdRef.current.get(id);
      if (hold && hold.holds > 0) {
        hold.overdue = true;
        return;
      }
      beginExit(id);
    },
    [beginExit],
  );

  const holdStart = useCallback((id: string) => {
    const hold = holdRef.current.get(id);
    if (!hold) return;
    hold.holds += 1;
  }, []);

  const holdEnd = useCallback(
    (id: string) => {
      const hold = holdRef.current.get(id);
      if (!hold) return;
      hold.holds = Math.max(0, hold.holds - 1);
      if (hold.holds === 0 && hold.overdue) beginExit(id);
    },
    [beginExit],
  );

  const dismiss = useCallback(
    (id?: string) => {
      if (id !== undefined) {
        beginExit(id);
        return;
      }
      itemsRef.current.forEach((item) => beginExit(item.id));
    },
    [beginExit],
  );

  const show = useCallback(
    (message: string, options?: Omit<ToastOptions, "message">) => {
      seqRef.current += 1;
      const id = `${idPrefix}-${seqRef.current}`;
      const type = options?.type ?? "default";
      const action = options?.action;
      const duration = options?.duration ?? (action ? ACTION_DURATION : defaultDuration);

      setItems((prev) => [...prev, { id, message, type, duration, action }]);

      if (duration > 0) {
        if (action) holdRef.current.set(id, { holds: 0, overdue: false });
        const timer = setTimeout(() => tryClose(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [defaultDuration, idPrefix, tryClose],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
      holdRef.current.clear();
    };
  }, []);

  const toast = useMemo<ToastApi>(() => {
    const api = ((message: string, options?: Omit<ToastOptions, "message">) =>
      show(message, options)) as ToastApi;

    api.success = (message, options) => show(message, { ...options, type: "success" });
    api.info = (message, options) => show(message, { ...options, type: "info" });
    api.warning = (message, options) => show(message, { ...options, type: "warning" });
    api.error = (message, options) => show(message, { ...options, type: "error" });
    api.dismiss = dismiss;

    return api;
  }, [dismiss, show]);

  const viewportClass = [styles.viewport, styles[position]].join(" ");

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className={viewportClass} aria-label="알림">
            {items.map((item) => (
              <Toast
                key={item.id}
                message={item.message}
                type={item.type}
                position={position}
                exiting={item.exiting}
                action={item.action}
                onExitComplete={() => remove(item.id)}
                onHoldStart={item.action ? () => holdStart(item.id) : undefined}
                onHoldEnd={item.action ? () => holdEnd(item.id) : undefined}
                onAction={item.action ? () => beginExit(item.id) : undefined}
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

/** ToastProvider 하위에서 토스트를 띄울 때 사용 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast는 반드시 <ToastProvider> 안에서 사용해야 합니다.");
  }
  return ctx.toast;
}
