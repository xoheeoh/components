import { type ReactNode } from "react";
import { Button } from "../Button";
import { Dialog } from "../Dialog";

export interface AlertAction {
  label: string;
  onClick?: () => void;
}

export interface AlertProps {
  open: boolean;
  onClose: () => void;

  /** 제목. 없으면 본문과 액션만 표시 */
  title?: string;
  /** 본문 메시지 */
  message?: ReactNode;

  /** 보조행동(닫기/취소 등) */
  secondaryAction?: AlertAction;
  /** 권장행동(확인, 이동 등) */
  primaryAction?: AlertAction;
  /** 부정행동(해제, 탈퇴 등) */
  destructiveAction?: AlertAction;
}

/** window.alert / confirm을 대체하는 모달 알림 */
export function Alert({
  open,
  onClose,
  title,
  message,
  secondaryAction,
  primaryAction,
  destructiveAction,
}: AlertProps) {
  const run = (action?: AlertAction) => {
    action?.onClick?.();
    onClose();
  };

  const hasThreeActions = Boolean(secondaryAction && primaryAction && destructiveAction);
  const destructiveVariant = hasThreeActions ? "outlined" : "solid";

  const body =
    message == null || message === false || message === "" ? undefined : typeof message === "string" ? (
      <p style={{ margin: 0, whiteSpace: "pre-line" }}>{message}</p>
    ) : (
      message
    );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      role="alertdialog"
      showCloseButton={false}
      closeOnOverlayClick={false}
      footer={
        <>
          {secondaryAction ? (
            <Button
              variant="outlined"
              color="neutral"
              label={secondaryAction.label}
              onClick={() => run(secondaryAction)}
              autoFocus={!primaryAction}
            />
          ) : null}
          {destructiveAction ? (
            <Button
              variant={destructiveVariant}
              color="destructive"
              label={destructiveAction.label}
              onClick={() => run(destructiveAction)}
              autoFocus={!primaryAction && !secondaryAction}
            />
          ) : null}
          {primaryAction ? (
            <Button
              variant="solid"
              color="primary"
              label={primaryAction.label}
              onClick={() => run(primaryAction)}
              autoFocus
            />
          ) : null}
        </>
      }>
      {body}
    </Dialog>
  );
}
