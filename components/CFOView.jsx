"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { runDesignCalcs, computeGrandTotal, fmt, fmtRs } from "@/lib/calculations";
import { STRUCTURES, BOQ_SECTIONS, BOQ_CATALOG } from "@/lib/boqData";

export default function CFOView({ projectId, project }) {
  const router = useRouter();
  const [margin, setMargin] = useState(project.gross_margin || 15);
  const [saving, setSaving] = useState(false);

  const inp       = project.design_inputs  || {};
  const boqManual = project.boq_manual     || {};
  const calc      = runDesignCalcs(inp);
  const { basic, gstAmt, grand } = computeGrandTotal(inp, calc, boqManual);
  const marginAmt = grand * (margin / 100);
  const finalCost = grand + marginAmt;

  async function handleApprove() {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gross_margin: margin, stage: 3, cfo_approved_at: new Date().toISOString() }),
      });
      // Notify finance team
      await fetch("/api/send-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "finance", to: project.finance_team_email,
          project: { ...project, gross_margin: margin, boq_total: grand },
        }),
      });
      router.push(`/project/${projectId}/finance`);
      router.refresh();
    } catch (err) {
      alert("Error: " + err.message);
      setSaving(false);
    }
  }

  // Section totals for summary table
  const secTotals = [];
  let mmsBs = STRUCTURES.reduce((s, st, i) => s + (inp.structures?.[i] || 0) * st.ratePerKW, 0);
  if (mmsBs > 0) secTotals.push({ label: "Module Mounting Structure", basic: mmsBs, gst: mmsBs * 0.18 });

  BOQ_SECTIONS.forEach(sec => {
    let b = 0, g = 0;
    BOQ_CATALOG.filter(i => i.sec === sec).forEach(item => {
      const { getEffective } = require("@/lib/calculations");
      const ef = getEffective(item, inp, calc, boqManual);
      b += ef.qty * ef.cpu; g += ef.qty * ef.cpu * item.gst;
    });
    if (b > 0) secTotals.push({ label: sec, basic: b, gst: g });
  });

  return (
    <div style={{ maxWidth: 860, margin: "32px auto", padding: "0 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

        {/* BoQ Summary */}
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", background: "#0d1b2a", color: "#f5a623", fontWeight: 700, fontSize: 14 }}>
            BoQ Cost Summary — {project.project_name}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 11 }}>Cost Head</th>
                <th style={{ padding: "10px 16px", textAlign: "right", color: "#64748b", fontWeight: 600, fontSize: 11 }}>Basic</th>
                <th style={{ padding: "10px 16px", textAlign: "right", color: "#64748b", fontWeight: 600, fontSize: 11 }}>GST</th>
                <th style={{ padding: "10px 16px", textAlign: "right", color: "#64748b", fontWeight: 600, fontSize: 11 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {secTotals.map((r, i) => (
                <tr key={r.label} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafbfc" }}>
                  <td style={{ padding: "9px 16px", color: "#0d1b2a" }}>{r.label}</td>
                  <td style={{ padding: "9px 16px", textAlign: "right", fontFamily: "monospace", color: "#475569" }}>{fmtRs(r.basic)}</td>
                  <td style={{ padding: "9px 16px", textAlign: "right", fontFamily: "monospace", color: "#94a3b8" }}>{fmtRs(r.gst)}</td>
                  <td style={{ padding: "9px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>{fmtRs(r.basic + r.gst)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#0d1b2a" }}>
                <td colSpan={3} style={{ padding: "12px 16px", color: "white", fontWeight: 700 }}>Grand Total (incl. GST)</td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#f5a623", fontSize: 15 }}>{fmtRs(grand)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Margin Input Panel */}
        <div>
          <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0d1b2a", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #f5a623" }}>
              Gross Margin
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Margin %
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="number" value={margin} min={0} max={100} step={0.5}
                  onChange={e => setMargin(parseFloat(e.target.value) || 0)}
                  style={{ flex: 1, padding: "10px 12px", fontSize: 20, fontFamily: "monospace", fontWeight: 700, background: "#fff8e7", border: "2px solid #f5c842", borderRadius: 8, textAlign: "center", outline: "none" }} />
                <span style={{ fontSize: 20, fontWeight: 700, color: "#64748b" }}>%</span>
              </div>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "#64748b" }}>Base BoQ Cost</span>
                <span style={{ fontFamily: "monospace" }}>{fmtRs(grand)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "#64748b" }}>Margin ({margin}%)</span>
                <span style={{ fontFamily: "monospace", color: "#f5a623", fontWeight: 600 }}>+ {fmtRs(marginAmt)}</span>
              </div>
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
                <span>Final Cost</span>
                <span style={{ fontFamily: "monospace", color: "#22c55e" }}>{fmtRs(finalCost)}</span>
              </div>
            </div>

            <button onClick={handleApprove} disabled={saving}
              style={{ width: "100%", padding: "12px", background: saving ? "#94a3b8" : "#f5a623", color: "#0d1b2a", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Approving..." : "Approve & Notify Finance →"}
            </button>
          </div>

          <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 14, border: "1px solid #bbf7d0", fontSize: 12, color: "#166534" }}>
            <b>What happens next:</b> Finance team receives an email with a link to complete the financial analysis and generate the client proposal.
          </div>
        </div>

      </div>
    </div>
  );
}
