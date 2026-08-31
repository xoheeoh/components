import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { mdiClose } from "@mdi/js";
import { Icon } from "../Icon";
import styles from "./Dialog.module.css";

export type DialogSize = "sm" | "md" | "lg";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.tabIndex !== -1 && getComputedStyle(el).visibility !== "hidden"
  );
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
  showCloseButton = true,
  role = "dialog",
  className,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const contentId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const hasTitle = title != null && title !== "";
  const hasDescription = description != null && description !== false && description !== "";
  const hasContent = children != null && children !== false;
  const hasHeader = hasTitle || hasDescription || showCloseButton;

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const id = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const autofocus = panel.querySelector<HTMLElement>("[autofocus]");
      const target = autofocus ?? getFocusable(panel)[0] ?? panel;
      target.focus();
    });

    return () => {
      window.cancelAnimationFrame(id);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = getFocusable(panel);
      if (nodes.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
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
  }, [open]);

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
    document.body
  );
}
