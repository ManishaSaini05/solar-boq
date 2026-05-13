"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sun } from "lucide-react";

export default function NewProject() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    project_name: "", client_name: "", client_email: "",
    site_location: "", design_team_email: "", cfo_email: "", finance_team_email: "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const project = await res.json();
      if (!res.ok) throw new Error(project.error);

      // Notify design team
      await fetch("/api/send-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "design", to: form.design_team_email, project }),
      });

      router.push(`/project/${project.id}/design`);
    } catch (err) {
      alert("Error: " + err.message);
      setSaving(false);
    }
  }

  const Field = ({ label, k, type = "text", placeholder, required }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <input type={type} value={form[k]} onChange={e => set(k, e.target.value)}
        placeholder={placeholder} required={required}
        style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: "1.5px solid #e2e8f0", borderRadius: 6, outline: "none", boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = "#f5a623"}
        onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <div style={{ background: "linear-gradient(135deg,#0d1b2a,#1b2f4a)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "#f5a623", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sun size={18} color="#0d1b2a" />
          </div>
          <span style={{ color: "#f5a623", fontWeight: 800, fontSize: 14 }}>SOLAR BoQ SYSTEM</span>
        </div>
        <Link href="/dashboard" style={{ color: "#94a3b8", fontSize: 12, textDecoration: "none" }}>← Back to Dashboard</Link>
      </div>

      <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ background: "white", borderRadius: 12, padding: 32, border: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 18, color: "#0d1b2a", fontWeight: 700 }}>Create New Project</h2>

          <form onSubmit={handleCreate}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0d1b2a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #f5a623" }}>
              Project Details
            </div>
            <Field label="Project Name"  k="project_name"  placeholder="e.g. Hyderabad Warehouse 1 MW" required />
            <Field label="Client Name"   k="client_name"   placeholder="e.g. ABC Industries Ltd." required />
            <Field label="Client Email"  k="client_email"  type="email" placeholder="client@company.com" />
            <Field label="Site Location" k="site_location" placeholder="e.g. Patancheru, Telangana" />

            <div style={{ fontSize: 11, fontWeight: 700, color: "#0d1b2a", textTransform: "uppercase", letterSpacing: "0.06em", margin: "20px 0 12px", paddingBottom: 8, borderBottom: "2px solid #f5a623" }}>
              Team Emails (for notifications)
            </div>
            <Field label="Design Team Email"  k="design_team_email"  type="email" placeholder="design@yourcompany.com" required />
            <Field label="CFO Email"          k="cfo_email"          type="email" placeholder="cfo@yourcompany.com" required />
            <Field label="Finance Team Email" k="finance_team_email" type="email" placeholder="finance@yourcompany.com" required />

            <button type="submit" disabled={saving}
              style={{ width: "100%", marginTop: 8, padding: "12px", background: saving ? "#94a3b8" : "#f5a623", color: "#0d1b2a", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Creating & notifying team..." : "Create Project →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
