import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ColorPalette.module.css";

export interface ColorPaletteProps {
  prefix: "--atomic-" | "--semantic-";
  title: string;
  description: string;
}

interface ResolvedToken {
  name: string;
  hex: string;
}

const FAMILY_LABELS: Record<string, string> = {
  common: "Common",
  gray: "Gray",
  blue: "Blue",
  red: "Red",
  green: "Green",
  orange: "Orange",
  redOrange: "Red Orange",
  cyan: "Cyan",
  indigo: "Indigo",
  purple: "Purple",
  pink: "Pink",
};

function listCustomProperties(prefix: string): string[] {
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
        if (name.startsWith(prefix) && !seen.has(name)) {
          seen.add(name);
          names.push(name);
        }
      }
    }
  }

  return names;
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  return `#${[match[1], match[2], match[3]]
    .map((value) => Number(value).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function tokenFamily(name: string, prefix: string): string {
  const rest = name.slice(prefix.length);
  if (prefix === "--atomic-") return rest.replace(/-\d+$/, "");
  const dash = rest.indexOf("-");
  return dash === -1 ? rest : rest.slice(0, dash);
}

function tokenStep(name: string, prefix: string): number | null {
  const match = name.slice(prefix.length).match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function displayName(family: string, name: string, prefix: string): string {
  const label = (FAMILY_LABELS[family] ?? family).replace(/\s/g, "");
  const rest = name.slice(prefix.length);
  const step = tokenStep(name, prefix);
  if (step != null) return `${label}-${step}`;
  const variant = rest.slice(family.length).replace(/^-/, "");
  return variant ? `${label}-${variant}` : label;
}

const BASE_STEP = 500;

export function ColorPalette({ prefix, title, description }: ColorPaletteProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [names, setNames] = useState<string[]>([]);
  const [resolved, setResolved] = useState<Record<string, ResolvedToken>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setNames(listCustomProperties(prefix));
  }, [prefix]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || names.length === 0) return;

    const next: Record<string, ResolvedToken> = {};
    for (const name of names) {
      const probe = document.createElement("span");
      probe.style.backgroundColor = `var(${name})`;
      root.appendChild(probe);
      const hex = rgbToHex(getComputedStyle(probe).backgroundColor);
      probe.remove();
      next[name] = { name, hex };
    }
    setResolved(next);
  }, [names]);

  const groups = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const name of names) {
      const family = tokenFamily(name, prefix);
      const list = map.get(family) ?? [];
      list.push(name);
      map.set(family, list);
    }
    return [...map.entries()].map(([family, tokens]) => {
      const sorted = [...tokens].sort((a, b) => {
        const stepA = tokenStep(a, prefix);
        const stepB = tokenStep(b, prefix);
        if (stepA == null || stepB == null) return 0;
        return stepB - stepA;
      });
      return [family, sorted] as const;
    });
  }, [names, prefix]);

  const copy = async (name: string) => {
    await navigator.clipboard.writeText(name);
    setCopied(name);
    window.setTimeout(() => setCopied((current) => (current === name ? null : current)), 1200);
  };

  return (
    <div ref={rootRef} className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{description}</p>
        </div>
      </header>

      {groups.map(([family, tokens]) => (
        <section key={family} className={styles.group}>
          <h2 className={styles.groupTitle}>{FAMILY_LABELS[family] ?? family}</h2>
          <div className={styles.ramp}>
            {tokens.map((name) => {
              const token = resolved[name];
              const isBase = tokenStep(name, prefix) === BASE_STEP;
              return (
                <button key={name} type="button" className={styles.swatch} onClick={() => copy(name)}>
                  <span className={styles.chip} style={{ background: `var(${name})` }}>
                    {isBase ? <span className={styles.dot} /> : null}
                  </span>
                  <span className={styles.meta}>
                    <span className={styles.name}>
                      {copied === name ? "Copied" : displayName(family, name, prefix)}
                    </span>
                    <span className={styles.value}>{token?.hex ?? "…"}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
