"use client";
import { useState } from "react";
import { runDesignCalcs, computeGrandTotal, computeFinance, fmt, fmtRs } from "@/lib/calculations";
import { FileDown, FileSpreadsheet, CheckCircle } from "lucide-react";

export default function ProposalActions({ projectId, project }) {
  const [downloading, setDownloading] = useState(false);

  const inp       = project.design_inputs  || {};
  const boqManual = project.boq_manual     || {};
  const calc      = runDesignCalcs(inp);
  const { grand } = computeGrandTotal(inp, calc, boqManual);
  const finCalc   = computeFinance({
    ...project.finance_inputs,
    plantCapacity: inp.systemSize || 0,
    grossMargin:   project.gross_margin || 0,
  }, grand);

  async function downloadExcel() {
    setDownloading(true);
    const res = await fetch(`/api/export-excel?id=${projectId}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = res.headers.get("content-disposition")?.split("filename=")[1]?.replace(/"/g, "") || "BoQ.xlsx";
    a.click(); URL.revokeObjectURL(url);
    setDownloading(false);
  }

  return (
    <div style={{ maxWidth: 860, margin: "32px auto", padding: "0 24px" }}>

      {/* Success banner */}
      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <CheckCircle size={22} color="#22c55e" />
        <div>
          <div style={{ fontWeight: 700, color: "#166534" }}>Project complete — ready to send to client</div>
          <div style={{ fontSize: 12, color: "#166534", opacity: 0.8, marginTop: 2 }}>All stages approved. Download the BoQ and proposal below.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

        {/* Excel BoQ */}
        <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <FileSpreadsheet size={24} color="#22c55e" />
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0d1b2a" }}>Bill of Quantities</div>
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
            Full 3-sheet Excel file: Summary, complete BoQ (327 rows), and Design Inputs — in your original format.
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#64748b" }}>System Size</span><b>{inp.systemSize} KWp</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#64748b" }}>BoQ Total (incl. GST)</span><b style={{ fontFamily: "monospace" }}>{fmtRs(grand)}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Final Cost (with margin)</span><b style={{ fontFamily: "monospace", color: "#22c55e" }}>{fmtRs(finCalc.finalCost)}</b>
            </div>
          </div>
          <button onClick={downloadExcel} disabled={downloading}
            style={{ width: "100%", padding: "11px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <FileSpreadsheet size={16} />
            {downloading ? "Generating..." : "Download BoQ (.xlsx)"}
          </button>
        </div>

        {/* Client Proposal (PDF) */}
        <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <FileDown size={24} color="#f5a623" />
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0d1b2a" }}>Client Proposal</div>
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
            Branded PDF proposal with project overview, financial analysis, and ROI — ready to send to client.
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#64748b" }}>Annual Savings</span><b style={{ fontFamily: "monospace", color: "#22c55e" }}>{fmtRs(finCalc.annualSavings)}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#64748b" }}>Payback Period</span><b style={{ fontFamily: "monospace", color: "#f5a623" }}>{fmt(finCalc.paybackPeriod, 1)} Years</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>ROI</span><b style={{ fontFamily: "monospace", color: "#8b5cf6" }}>{fmt(finCalc.roi, 1)}%</b>
            </div>
          </div>
          <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: 10, fontSize: 11, color: "#854d0e", textAlign: "center" }}>
            PDF generation coming in the next build phase.<br />The BoQ Excel is ready now.
          </div>
        </div>

      </div>

      {/* Project summary card */}
      <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#0d1b2a", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #f5a623" }}>
          Project Summary — {project.project_name}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Client",          val: project.client_name },
            { label: "System Size",     val: `${inp.systemSize} KWp` },
            { label: "Total Modules",   val: `${fmt(calc.noOfModules)} No.s` },
            { label: "Total Inverters", val: `${calc.totalInv} No.s` },
            { label: "Base Cost",       val: fmtRs(grand) },
            { label: "Gross Margin",    val: `${project.gross_margin}%` },
            { label: "Final Cost",      val: fmtRs(finCalc.finalCost) },
            { label: "Cost/KWp",        val: fmtRs(finCalc.costPerKWp) },
          ].map(k => (
            <div key={k.label} style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>{k.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: "#0d1b2a" }}>{k.val}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
