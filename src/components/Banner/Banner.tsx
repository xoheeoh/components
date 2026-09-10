import { type CSSProperties, type ReactNode } from "react";
import { mdiAlert, mdiAlertCircle, mdiCheckCircle, mdiInformation } from "@mdi/js";
import { Icon } from "../Icon";
import styles from "./Banner.module.css";

export type BannerType = "success" | "info" | "warning" | "error";

export interface BannerProps {
  /** 표시할 메시지. */
  message: string;
  type: BannerType;
  /** 메시지 아래 상세 내용(응답 본문 등) */
  detailMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const ICON_BY_TYPE: Record<BannerType, string> = {
  success: mdiCheckCircle,
  info: mdiInformation,
  warning: mdiAlert,
  error: mdiAlertCircle,
};

const ICON_CLASS_BY_TYPE: Record<BannerType, string> = {
  success: styles.iconSuccess,
  info: styles.iconInfo,
  warning: styles.iconWarning,
  error: styles.iconError,
};

/** 화면 레이아웃에 고정되는 인라인 안내 — Toast와 동일 비주얼, 자동 사라짐 없음 */
export function Banner({ message, type, detailMessage, className, style }: BannerProps) {
  const bannerClass = [styles.banner, styles[type], className].filter(Boolean).join(" ");

  return (
    <div role="status" aria-live="polite" className={bannerClass} style={style}>
      <Icon
        path={ICON_BY_TYPE[type]}
        size={20}
        className={[styles.icon, ICON_CLASS_BY_TYPE[type]].join(" ")}
      />
      <div className={styles.body}>
        <p className={styles.message}>{message}</p>

        {detailMessage ? (
          <div
            className={[
              "text-caption1",
              typeof detailMessage === "string" ? styles.detailString : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {detailMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
