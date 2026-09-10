import { useEffect, useMemo, useState } from "react";
import styles from "./Typography.module.css";

const SAMPLE = "다람쥐 헌 쳇바퀴에 타고파 The quick brown fox";
const PREFIX = "--text-";
const PARTS = ["letter-spacing", "line-height", "size", "weight"] as const;
const GROUP_ORDER = ["heading", "subtitle", "body", "caption"];

type Part = (typeof PARTS)[number];

interface RoleTokens {
  name: string;
  group: string;
  size: string;
  weight: string;
  tracking: string;
  lineHeight: string;
}

function parseTextToken(name: string): { role: string; part: Part } | null {
  if (!name.startsWith(PREFIX)) return null;
  for (const part of PARTS) {
    const suffix = `-${part}`;
    if (name.endsWith(suffix)) {
      return { role: name.slice(PREFIX.length, -suffix.length), part };
    }
  }
  return null;
}

function listDeclaredProperties(): Record<string, string> {
  const declared: Record<string, string> = {};

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
        if (name === "--font-sans" || name.startsWith(PREFIX)) {
          declared[name] = rule.style.getPropertyValue(name).trim();
        }
      }
    }
  }

  return declared;
}

function groupOf(role: string): string {
  const match = role.match(/^[a-z]+/);
  return match?.[0] ?? role;
}

function roleOrder(name: string): number {
  const match = name.match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

export function Typography() {
  const [copied, setCopied] = useState<string | null>(null);
  const [declared, setDeclared] = useState<Record<string, string>>({});

  useEffect(() => {
    setDeclared(listDeclaredProperties());
  }, []);

  const roles = useMemo(() => {
    const map = new Map<string, RoleTokens>();
    for (const [name, value] of Object.entries(declared)) {
      const parsed = parseTextToken(name);
      if (!parsed) continue;
      const current = map.get(parsed.role) ?? {
        name: parsed.role,
        group: groupOf(parsed.role),
        size: "",
        weight: "",
        tracking: "",
        lineHeight: "",
      };
      if (parsed.part === "size") current.size = value;
      if (parsed.part === "weight") current.weight = value;
      if (parsed.part === "letter-spacing") current.tracking = value;
      if (parsed.part === "line-height") current.lineHeight = value;
      map.set(parsed.role, current);
    }
    return [...map.values()].sort((a, b) => {
      const group = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group);
      return group !== 0 ? group : roleOrder(a.name) - roleOrder(b.name);
    });
  }, [declared]);

  const groups = useMemo(() => {
    const map = new Map<string, RoleTokens[]>();
    for (const role of roles) {
      const list = map.get(role.group) ?? [];
      list.push(role);
      map.set(role.group, list);
    }
    return [...map.entries()];
  }, [roles]);

  const copy = async (name: string) => {
    await navigator.clipboard.writeText(`text-${name}`);
    setCopied(name);
    window.setTimeout(() => setCopied((current) => (current === name ? null : current)), 1200);
  };

  const fontSans = declared["--font-sans"] ?? "…";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Typography</h1>
          <p className={styles.subtitle}>
            역할별 글자 스타일입니다. 행을 클릭하면 className(`text-caption1` 등)을 복사합니다.
          </p>
        </div>
      </header>

      <div className={styles.facts}>
        <div className={styles.fact}>
          <span className={styles.factName}>--font-sans</span>
          <span className={styles.factValue}>{fontSans}</span>
        </div>
      </div>

      {groups.map(([group, groupRoles]) => (
        <section key={group} className={styles.group}>
          <h2 className={styles.groupTitle}>{group.charAt(0).toUpperCase() + group.slice(1)}</h2>
          {groupRoles.map((role) => (
            <button
              key={role.name}
              type="button"
              className={styles.row}
              onClick={() => copy(role.name)}
            >
              <span className={styles.role}>
                {copied === role.name ? "Copied" : `text-${role.name}`}
              </span>
              <span>
                <p className={`${styles.sample} text-${role.name}`}>{SAMPLE}</p>
                <span className={styles.meta}>
                  {[role.size, role.weight, role.tracking, role.lineHeight]
                    .filter(Boolean)
                    .join(" / ")}
                </span>
              </span>
            </button>
          ))}
        </section>
      ))}
    </div>
  );
}
