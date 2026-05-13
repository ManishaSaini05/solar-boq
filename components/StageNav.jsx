"use client";
import Link from "next/link";
import { Sun } from "lucide-react";

const STAGES = [
  { n: 1, label: "Site Survey",   path: "" },
  { n: 2, label: "Design & BoQ", path: "design" },
  { n: 3, label: "CFO Approval", path: "cfo" },
  { n: 4, label: "Finance",      path: "finance" },
  { n: 5, label: "Proposal",     path: "proposal" },
];

export default function StageNav({ projectId, currentStage, projectName, completedStage }) {
  return (
    <div style={{ background: "linear-gradient(135deg,#0d1b2a,#1b2f4a)", padding: "0 24px" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "#f5a623", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sun size={18} color="#0d1b2a" />
          </div>
          <div>
            <div style={{ color: "#f5a623", fontWeight: 800, fontSize: 14, letterSpacing: "0.05em" }}>SOLAR BoQ SYSTEM</div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>{projectName}</div>
          </div>
        </div>
        <Link href="/dashboard" style={{ color: "#94a3b8", fontSize: 12, textDecoration: "none" }}>
          ← All Projects
        </Link>
      </div>

      {/* Stage pills */}
      <div style={{ display: "flex", gap: 4, paddingBottom: 0 }}>
        {STAGES.map((s) => {
          const isDone    = completedStage >= s.n;
          const isCurrent = currentStage === s.n;
          const isLocked  = s.n > (completedStage + 1);
          const href      = isLocked ? "#" : `/project/${projectId}/${s.path || "design"}`;

          return (
            <Link
              key={s.n}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px",
                borderBottom: isCurrent ? "2px solid #f5a623" : "2px solid transparent",
                color: isCurrent ? "#f5a623" : isDone ? "#22c55e" : "#64748b",
                fontSize: 12, fontWeight: isCurrent ? 700 : 400,
                textDecoration: "none",
                cursor: isLocked ? "not-allowed" : "pointer",
                opacity: isLocked ? 0.4 : 1,
              }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: "50%",
                background: isCurrent ? "#f5a623" : isDone ? "#22c55e" : "#334155",
                color: isCurrent || isDone ? "#0d1b2a" : "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700,
              }}>
                {isDone && !isCurrent ? "✓" : s.n}
              </span>
              {s.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
