"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { runDesignCalcs, computeGrandTotal, computeFinance, fmt, fmtRs } from "@/lib/calculations";

export default function FinanceView({ projectId, project }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fin, setFin] = useState({
    annualGenPerKWp:   project.finance_inputs?.annualGenPerKWp   || 1400,
    discomTariff:      project.finance_inputs?.discomTariff      || 7.5,
    addonSupply:       project.finance_inputs?.addonSupply       || 0,
    addonInstallation: project.finance_inputs?.addonInstallation || 0,
    ...project.finance_inputs,
  });

  const inp   = project.design_inputs || {};
  const calc  = runDesignCalcs(inp);
  const { grand } = computeGrandTotal(inp, calc, project.boq_manual || {});

  const finCalc = useMemo(() => computeFinance({
    ...fin,
    plantCapacity: inp.systemSize || 0,
    grossMargin:   project.gross_margin || 0,
  }, grand), [fin, grand, inp.systemSize, project.gross_margin]);

  const setF = (k, v) => setFin(p => ({ ...p, [k]: parseFloat(v) || 0 }));

  async function handleSaveAndProposal() {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finance_inputs: fin, stage: 4, finance_completed_at: new Date().toISOString() }),
      });
      router.push(`/project/${projectId}/proposal`);
      router.refresh();
    } catch (err) {
      alert("Error: " + err.message); setSaving(false);
    }
  }

  const NF = ({ label, k, unit, hint }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 4 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input type="number" value={fin[k]} min={0}
          onChange={e => setF(k, e.target.value)}
          style={{ flex: 1, padding: "7px 10px", fontSize: 14, fontFamily: "monospace", background: "#fff8e7", border: "2px solid #f5c842", borderRadius: 6, outline: "none" }} />
        {unit && <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{unit}</span>}
      </div>
      {hint && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{hint}</div>}
    </div>
  );

  const KPI = ({ label, value, accent, sub }) => (
    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "14px 16px", border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: accent || "#0d1b2a" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: "32px auto", padding: "0 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>

        {/* Input Panel */}
        <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0d1b2a", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #f5a623" }}>
            Financial Inputs
          </div>

          {/* Pre-filled read-only */}
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: 12, marginBottom: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Pre-filled from BoQ</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "#64748b" }}>Plant Capacity</span>
              <b style={{ fontFamily: "monospace" }}>{inp.systemSize} KWp</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "#64748b" }}>BoQ Base Cost</span>
              <b style={{ fontFamily: "monospace" }}>{fmtRs(grand)}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#64748b" }}>Gross Margin</span>
              <b style={{ fontFamily: "monospace", color: "#f5a623" }}>{project.gross_margin}%</b>
            </div>
          </div>

          <NF label="Annual Generation per KWp" k="annualGenPerKWp" unit="kWh/KWp/yr" hint="Typically 1300–1500 for South India" />
          <NF label="DISCOM Tariff" k="discomTariff" unit="₹/kWh" hint="Current tariff slab for this client" />
          <NF label="Add-on: Supply" k="addonSupply" unit="₹" hint="Any additional supply costs" />
          <NF label="Add-on: Installation" k="addonInstallation" unit="₹" hint="Any additional installation costs" />

          <button onClick={handleSaveAndProposal} disabled={saving}
            style={{ width: "100%", marginTop: 8, padding: "12px", background: saving ? "#94a3b8" : "#f5a623", color: "#0d1b2a", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : "Save & Generate Proposal →"}
          </button>
        </div>

        {/* Live Financial Analysis */}
        <div>
          <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0d1b2a", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #f5a623" }}>
              Financial Analysis — Live Preview
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              <KPI label="Final Project Cost"   value={fmtRs(finCalc.finalCost)}    accent="#0d1b2a" />
              <KPI label="Cost per KWp"         value={fmtRs(finCalc.costPerKWp)}   sub="incl. margin" />
              <KPI label="Annual Generation"    value={`${fmt(finCalc.annualGeneration)} kWh`} sub="estimated" />
              <KPI label="Annual Savings"       value={fmtRs(finCalc.annualSavings)} accent="#22c55e" />
              <KPI label="Payback Period"       value={`${fmt(finCalc.paybackPeriod, 1)} Yrs`} accent="#f5a623" />
              <KPI label="ROI"                  value={`${fmt(finCalc.roi, 1)}%`}   accent="#8b5cf6" sub="per annum" />
            </div>

            {/* Cost breakdown table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {[
                  ["BoQ Base Cost (incl. GST)",   fmtRs(grand),                    "#475569"],
                  [`Gross Margin (${project.gross_margin}%)`, fmtRs(finCalc.marginAmount), "#f5a623"],
                  ["Add-on: Supply",              fmtRs(fin.addonSupply),           "#475569"],
                  ["Add-on: Installation",        fmtRs(fin.addonInstallation),     "#475569"],
                ].map(([label, val, col]) => (
                  <tr key={label} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "8px 0", color: "#64748b" }}>{label}</td>
                    <td style={{ padding: "8px 0", textAlign: "right", fontFamily: "monospace", color: col }}>{val}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #e2e8f0" }}>
                  <td style={{ padding: "10px 0", fontWeight: 700, color: "#0d1b2a" }}>Total Project Cost</td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#22c55e", fontSize: 16 }}>{fmtRs(finCalc.finalCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: "#eff6ff", borderRadius: 8, padding: 14, border: "1px solid #bfdbfe", fontSize: 12, color: "#1e40af" }}>
            <b>All numbers update live.</b> When you're happy with the analysis, click "Save & Generate Proposal" to lock the values and move to the proposal stage.
          </div>
        </div>

      </div>
    </div>
  );
}
