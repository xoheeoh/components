export type ArrowKeyAxis = "horizontal" | "both";

/**
 * 화살표·Home·End 키로 그룹 안의 다음 요소를 찾는다. 양끝에서는 반대편으로 순환한다.
 * 탭·라디오 그룹처럼 "Tab 정지점은 하나, 안에서는 화살표로 이동"하는 패턴(roving tabindex)에 쓴다.
 *
 * - horizontal: ←→만 (탭 목록)
 * - both: ←→↑↓ 모두 (라디오 그룹)
 *
 * 이동 키가 아니거나 항목이 없으면 null.
 */
export function findNextByArrowKey(
  items: HTMLElement[],
  current: Element | null,
  key: string,
  axis: ArrowKeyAxis = "both",
): HTMLElement | null {
  if (items.length === 0) return null;
  if (key === "Home") return items[0];
  if (key === "End") return items[items.length - 1];

  const isNext = key === "ArrowRight" || (axis === "both" && key === "ArrowDown");
  const isPrev = key === "ArrowLeft" || (axis === "both" && key === "ArrowUp");
  if (!isNext && !isPrev) return null;

  const index = current ? items.indexOf(current as HTMLElement) : -1;
  // 그룹 안에 포커스가 없었다면 방향에 맞는 끝에서 시작한다.
  if (index === -1) return isNext ? items[0] : items[items.length - 1];
  const step = isNext ? 1 : -1;
  return items[(index + step + items.length) % items.length];
}
