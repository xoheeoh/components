/**
 * Vite 빌드 전용 진입점. CSS import를 여기에만 두어 dist/index.d.ts에
 * 존재하지 않는 "./styles/styles.css" import가 새지 않게 한다.
 * (tsconfig.build.json에서 이 파일은 제외된다.)
 */
import "./styles/styles.css";

export * from "./index";
