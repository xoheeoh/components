import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { mdiClose } from "@mdi/js";
import { Icon } from "../Icon";
import styles from "./Dialog.module.css";

export type DialogSize = "sm" | "md" | "lg";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isFocusable(el: HTMLElement): boolean {
  if (el.tabIndex === -1) return false;
  const style = getComputedStyle(el);
  if (style.visibility === "hidden" || style.display === "none") return false;
  // 조상에 display:none이 걸린 경우와 레이아웃 박스가 아예 없는 경우까지 걸러낸다.
  // Checkbox·Radio처럼 1px + clip으로 숨긴 input은 박스가 남아 포커스 대상으로 유지된다.
  return el.getClientRects().length > 0;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isFocusable);
}

/**
 * 열린 Dialog 스택. 두 가지를 담당한다.
 * - 겹쳐 열렸을 때 키보드 이벤트를 최상단 하나만 처리하게 한다.
 * - body 스크롤 락을 참조 카운트로 관리해, 먼저 열린 쪽이 닫혀도 락이 풀리지 않게 한다.
 */
const openDialogs: string[] = [];
let bodyOverflowBeforeLock: string | null = null;

function pushDialog(id: string) {
  openDialogs.push(id);
  if (openDialogs.length === 1) {
    bodyOverflowBeforeLock = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
}

function popDialog(id: string) {
  const index = openDialogs.lastIndexOf(id);
  if (index !== -1) openDialogs.splice(index, 1);
  if (openDialogs.length === 0 && bodyOverflowBeforeLock !== null) {
    document.body.style.overflow = bodyOverflowBeforeLock;
    bodyOverflowBeforeLock = null;
  }
}

function isTopDialog(id: string): boolean {
  return openDialogs[openDialogs.length - 1] === id;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;

  /** 제목. 없으면 헤더에서 숨김 */
  title?: string;
  /** 제목 아래 보조 설명 */
  description?: ReactNode;
  /** 하단 버튼 영역 */
  footer?: ReactNode;
  /** 본문. 없으면 제목·설명·푸터만 표시 */
  children?: ReactNode;
  /** 패널 너비. 기본값 md */
  size?: DialogSize;
  /** 오버레이 클릭 시 닫기. 기본값 true */
  closeOnOverlayClick?: boolean;
  /** Escape 키로 닫기. 기본값 true */
  closeOnEscape?: boolean;
  /** 헤더 오른쪽 닫기 버튼. 기본값 true */
  showCloseButton?: boolean;
  role?: "dialog" | "alertdialog";
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  role = "dialog",
  className,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const contentId = useId();
  const instanceId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const hasTitle = title != null && title !== "";
  const hasDescription = description != null && description !== false && description !== "";
  const hasContent = children != null && children !== false;
  const hasHeader = hasTitle || hasDescription || showCloseButton;

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    pushDialog(instanceId);

    const id = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const autofocus = panel.querySelector<HTMLElement>("[autofocus]");
      const target = (autofocus && isFocusable(autofocus) ? autofocus : null) ?? getFocusable(panel)[0] ?? panel;
      target.focus();
      // 대상이 실제로 포커스를 받지 못했으면 패널로 되돌린다.
      // 그러지 않으면 포커스가 오버레이 뒤 요소에 남는다.
      if (!panel.contains(document.activeElement)) panel.focus();
    });

    return () => {
      window.cancelAnimationFrame(id);
      popDialog(instanceId);
      restoreFocusRef.current?.focus();
    };
  }, [open, instanceId]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 안쪽 컴포넌트가 이미 처리한 키는 건너뛴다 (예: 팝오버가 Escape를 소비한 경우).
      if (event.defaultPrevented) return;
      // 겹쳐 열렸을 때는 최상단 다이얼로그만 반응한다.
      if (!isTopDialog(instanceId)) return;
      const panel = panelRef.current;
      if (!panel) return;

      if (event.key === "Escape") {
        if (!closeOnEscape) return;
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const nodes = getFocusable(panel);
      // 포커스 가능 요소가 없으면 Tab을 가로채지 않는다. 가로채면 키가 영구히 삼켜져
      // 키보드만으로 빠져나갈 수 없다 (WCAG 2.1.2 키보드 트랩).
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEscape, onClose, instanceId]);

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlayClick) onClose();
  }, [closeOnOverlayClick, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : hasContent ? contentId : undefined}
        aria-describedby={hasDescription ? descriptionId : undefined}
        tabIndex={-1}
        className={[styles.panel, styles[size], className].filter(Boolean).join(" ")}
        onClick={(event) => event.stopPropagation()}>
        {hasHeader ? (
          <div className={styles.header}>
            <div className={styles.heading}>
              {hasTitle ? (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              ) : null}
              {hasDescription ? (
                typeof description === "string" ? (
                  <p id={descriptionId} className={styles.description}>
                    {description}
                  </p>
                ) : (
                  <div id={descriptionId} className={styles.description}>
                    {description}
                  </div>
                )
              ) : null}
            </div>
            {showCloseButton ? (
              <button type="button" className={styles.closeButton} aria-label="닫기" onClick={onClose}>
                <Icon path={mdiClose} size={20} />
              </button>
            ) : null}
          </div>
        ) : null}
        {hasContent ? (
          <div id={contentId} className={styles.content}>
            {children}
          </div>
        ) : null}
        {footer != null && footer !== false ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
