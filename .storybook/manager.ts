/// <reference path="./env.d.ts" />
import "../src/styles/styles.css";
import "../src/styles/fonts.css";

// 브라우저 탭 제목에서 "Storybook"이라는 이름을 패키지 이름으로 바꾼다.
// 스토리북은 탭 제목을 "스토리 이름 ⋅ Storybook" 꼴로 계속 다시 쓰고, 이 이름을 바꾸는 설정이 없다.
// 그래서 제목이 바뀔 때마다 지켜보다가 끝의 이름만 갈아 끼운다.
// 예: "Components / Action / Button - Default ⋅ @xoheeoh/components"
const SITE_NAME = "@xoheeoh/components";
const TITLE_SEPARATOR = " ⋅ ";

function renameTabTitle() {
  const storyPart = document.title.includes(TITLE_SEPARATOR)
    ? document.title.slice(0, document.title.lastIndexOf(TITLE_SEPARATOR))
    : "";
  const renamed = storyPart ? `${storyPart}${TITLE_SEPARATOR}${SITE_NAME}` : SITE_NAME;
  // 이미 바꾼 제목이면 다시 쓰지 않는다 (다시 쓰면 아래 감시가 끝없이 반복된다).
  if (document.title !== renamed) document.title = renamed;
}

renameTabTitle();
new MutationObserver(renameTabTitle).observe(document.head, {
  childList: true,
  subtree: true,
  characterData: true,
});
