import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Sun, Plus } from "lucide-react";

const STAGE_LABELS = ["", "Survey", "Design", "CFO", "Finance", "Proposal"];
const STAGE_COLORS = ["", "#3b82f6", "#14b8a6", "#f5a623", "#8b5cf6", "#22c55e"];

export const revalidate = 0;

export default async function Dashboard() {
  const { data: projects = [] } = await supabase
    .from("projects")
    .select("id, project_name, client_name, site_location, stage, created_at")
    .order("created_at", { ascending: false });

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0d1b2a,#1b2f4a)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: "#f5a623", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sun size={20} color="#0d1b2a" />
          </div>
          <div>
            <div style={{ color: "#f5a623", fontWeight: 800, fontSize: 16, letterSpacing: "0.06em" }}>SOLAR BoQ SYSTEM</div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>Project Dashboard</div>
          </div>
        </div>
        <Link href="/new-project"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5a623", color: "#0d1b2a", padding: "8px 18px", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
          <Plus size={16} /> New Project
        </Link>
      </div>

      <div style={{ padding: "28px 32px" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#0d1b2a", marginBottom: 20 }}>
          All Projects ({projects.length})
        </div>

        {projects.length === 0 ? (
          <div style={{ background: "white", borderRadius: 12, padding: 48, textAlign: "center", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>No projects yet.</div>
            <Link href="/new-project"
              style={{ background: "#f5a623", color: "#0d1b2a", padding: "10px 22px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              Create your first project
            </Link>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0d1b2a" }}>
                  {["Project Name", "Client", "Location", "Stage", "Created", "Action"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#f5a623", fontSize: 12, fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => {
                  const stageColor = STAGE_COLORS[p.stage] || "#94a3b8";
                  const stagePaths = ["", "design", "design", "cfo", "finance", "proposal"];
                  const href = `/project/${p.id}/${stagePaths[p.stage] || "design"}`;
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafbfc" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0d1b2a" }}>{p.project_name}</td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>{p.client_name}</td>
                      <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 13 }}>{p.site_location || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: stageColor + "22", color: stageColor, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          Stage {p.stage} — {STAGE_LABELS[p.stage]}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 12 }}>
                        {new Date(p.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Link href={href}
                          style={{ background: "#f5a623", color: "#0d1b2a", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                          Open →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
