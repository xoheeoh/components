import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Elevation.module.css";

const PREFIX = "--shadow-";
const SIZE_ORDER = ["xs", "sm", "md", "lg", "xl"];
const FAMILY_LABELS: Record<string, string> = {
  normal: "Normal",
  spread: "Spread",
};

function listShadowTokens(): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }

    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      for (let i = 0; i < rule.style.length; i += 1) {
        const name = rule.style.item(i);
        if (name.startsWith(PREFIX) && !seen.has(name)) {
          seen.add(name);
          names.push(name);
        }
      }
    }
  }

  return names;
}

function tokenFamily(name: string): string {
  const rest = name.slice(PREFIX.length);
  const dash = rest.indexOf("-");
  return dash === -1 ? rest : rest.slice(0, dash);
}

function tokenSize(name: string): string {
  const rest = name.slice(PREFIX.length);
  const dash = rest.indexOf("-");
  return dash === -1 ? rest : rest.slice(dash + 1);
}

export function Elevation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [names, setNames] = useState<string[]>([]);
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setNames(listShadowTokens());
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || names.length === 0) return;

    const next: Record<string, string> = {};
    for (const name of names) {
      const probe = document.createElement("span");
      probe.style.boxShadow = `var(${name})`;
      root.appendChild(probe);
      next[name] = getComputedStyle(probe).boxShadow;
      probe.remove();
    }
    setResolved(next);
  }, [names]);

  const groups = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const name of names) {
      const family = tokenFamily(name);
      const list = map.get(family) ?? [];
      list.push(name);
      map.set(family, list);
    }
    return [...map.entries()].map(([family, tokens]) => {
      const sorted = [...tokens].sort(
        (a, b) => SIZE_ORDER.indexOf(tokenSize(a)) - SIZE_ORDER.indexOf(tokenSize(b)),
      );
      return [family, sorted] as const;
    });
  }, [names]);

  const copy = async (name: string) => {
    await navigator.clipboard.writeText(name);
    setCopied(name);
    window.setTimeout(() => setCopied((current) => (current === name ? null : current)), 1200);
  };

  return (
    <div ref={rootRef} className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Elevation</h1>
          <p className={styles.subtitle}>
            그림자로 높이를 표현합니다. 카드의 <code>box-shadow</code>에 토큰을 넣으세요. 클릭하면
            이름을 복사합니다.
          </p>
        </div>
      </header>

      {groups.map(([family, tokens]) => (
        <section key={family} className={styles.group}>
          <h2 className={styles.groupTitle}>{FAMILY_LABELS[family] ?? family}</h2>
          <div className={`${styles.grid} ${family === "spread" ? styles.spread : ""}`}>
            {tokens.map((name) => (
              <button key={name} type="button" className={styles.item} onClick={() => copy(name)}>
                <span className={styles.card} style={{ boxShadow: `var(${name})` }} />
                <span className={styles.meta}>
                  <span className={styles.name}>{copied === name ? "Copied" : name}</span>
                  <span className={styles.value}>{resolved[name] ?? "…"}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
