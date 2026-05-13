"use client";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sun, Zap, Calculator, FileText, BarChart3, Shield, Download } from "lucide-react";
import { runDesignCalcs, getEffective, computeGrandTotal, fmt, fmtRs } from "@/lib/calculations";
import { STRUCTURES, BOQ_CATALOG, BOQ_SECTIONS, DEFAULT_DESIGN_INPUTS,
         CABLE_SIZES, DCDB_OPTS, ACDB_OPTS, LIAISONING_RATES } from "@/lib/boqData";

// ─── MINI INPUT COMPONENTS ─────────────────────────────────────────────────
function NF({ label, val, set, unit, hint, min = 0 }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input type="number" value={val} min={min} onChange={e => set(parseFloat(e.target.value) || 0)}
          style={{ flex: 1, padding: "6px 10px", fontSize: 13, fontFamily: "monospace", background: "#fff8e7", border: "2px solid #f5c842", borderRadius: 6, color: "#0d1b2a", outline: "none" }} />
        {unit && <span style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>{unit}</span>}
      </div>
      {hint && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{hint}</div>}
    </div>
  );
}
function SF({ label, val, set, opts }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>{label}</div>}
      <select value={val} onChange={e => set(e.target.value)}
        style={{ width: "100%", padding: "6px 10px", fontSize: 12, background: "#fff8e7", border: "2px solid #f5c842", borderRadius: 6, color: "#0d1b2a", outline: "none" }}>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function CV({ label, val, unit }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 11, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: "#0d1b2a" }}>{fmt(val, 2)} <span style={{ fontSize: 10, fontWeight: 400, color: "#94a3b8" }}>{unit}</span></span>
    </div>
  );
}
function Card({ title, icon, children }) {
  return (
    <div style={{ background: "white", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "2px solid #f5a623" }}>
        {icon && <span style={{ color: "#f5a623" }}>{icon}</span>}
        <span style={{ fontWeight: 700, fontSize: 13, color: "#0d1b2a" }}>{title}</span>
      </div>
      <div style={{ padding: "14px 16px" }}>{children}</div>
    </div>
  );
}
function clsBadge(c) {
  const map = { A: ["#dbeafe","#1d4ed8"], B: ["#d1fae5","#065f46"], C: ["#fef9c3","#854d0e"], S: ["#fce7f3","#9d174d"] };
  const [bg, col] = map[c] || ["#f1f5f9","#475569"];
  return <span style={{ background: bg, color: col, padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{c}</span>;
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function BoQCalculator({ projectId, project, initialInputs, initialBoqManual }) {
  const router = useRouter();
  const [tab, setTab]       = useState("inputs");
  const [collapsed, setCol] = useState({});
  const [saving, setSaving] = useState(false);
  const [inp, setInp]       = useState(initialInputs || DEFAULT_DESIGN_INPUTS);
  const [boqManual, setBoqManual] = useState(() => {
    const base = {};
    BOQ_CATALOG.forEach(i => { base[i.id] = { qty: 0, cpu: 0 }; });
    return { ...base, ...(initialBoqManual || {}) };
  });

  // ── Calculations ───────────────────────────────────────────────────────
  const calc    = useMemo(() => runDesignCalcs(inp), [inp]);
  const totals  = useMemo(() => computeGrandTotal(inp, calc, boqManual), [inp, calc, boqManual]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const setI    = (k, v) => setInp(p => ({ ...p, [k]: v }));
  const setInv  = (idx, k, v) => setInp(p => { const a = [...p.inv]; a[idx] = { ...a[idx], [k]: v }; return { ...p, inv: a }; });
  const setAcdb = (idx, k, v) => setInp(p => { const a = [...p.acdb]; a[idx] = { ...a[idx], [k]: v }; return { ...p, acdb: a }; });
  const setStr  = (idx, v)    => setInp(p => { const a = [...p.structures]; a[idx] = parseFloat(v) || 0; return { ...p, structures: a }; });
  const setMan  = (id, k, v)  => setBoqManual(p => ({ ...p, [id]: { ...p[id], [k]: parseFloat(v) || 0 } }));

  // ── Save ───────────────────────────────────────────────────────────────
  async function handleSaveAndSubmit() {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          design_inputs: inp,
          boq_manual: boqManual,
          boq_total: totals.grand,
          stage: Math.max(project.stage, 2),
          design_completed_at: new Date().toISOString(),
        }),
      });
      // Email CFO
      await fetch("/api/send-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cfo", to: project.cfo_email,
          project: { ...project, design_inputs: inp, boq_total: totals.grand },
        }),
      });
      router.push(`/project/${projectId}/cfo`);
      router.refresh();
    } catch (err) {
      alert("Error: " + err.message); setSaving(false);
    }
  }

  async function handleAutoSave() {
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ design_inputs: inp, boq_manual: boqManual, boq_total: totals.grand }),
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      {/* Sub-header toolbar */}
      <div style={{ background: "#1b2f4a", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { k: "inputs",  label: "Design Inputs",      icon: <Calculator size={13} /> },
            { k: "boq",     label: "Bill of Quantities", icon: <FileText   size={13} /> },
            { k: "summary", label: "Summary",            icon: <BarChart3  size={13} /> },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ padding: "7px 16px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
                background: tab === t.k ? "#f5a623" : "transparent", color: tab === t.k ? "#0d1b2a" : "#94a3b8", borderRadius: 6 }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 6, padding: "4px 12px", color: "#22c55e", fontSize: 12, fontFamily: "monospace" }}>
            Total: {fmtRs(totals.grand)}
          </div>
          <button onClick={handleAutoSave}
            style={{ padding: "6px 14px", background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
            Save Draft
          </button>
          <button onClick={handleSaveAndSubmit} disabled={saving}
            style={{ padding: "6px 16px", background: saving ? "#64748b" : "#f5a623", color: "#0d1b2a", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {saving ? "Saving..." : "Submit to CFO →"}
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1280, margin: "0 auto" }}>

        {/* ═══ DESIGN INPUTS TAB ═══ */}
        {tab === "inputs" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* DC Sizing */}
            <Card title="DC Sizing" icon={<Zap size={15} />}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                <NF label="System Size"           val={inp.systemSize}           set={v => setI("systemSize", v)}           unit="KWp" />
                <NF label="Module Size"           val={inp.moduleSize}           set={v => setI("moduleSize", v)}           unit="Wp" />
                <NF label="Avg String Size"       val={inp.avgStringSize}        set={v => setI("avgStringSize", v)}        unit="Panels" />
                <NF label="Longest String Length" val={inp.longestStringLength}  set={v => setI("longestStringLength", v)}  unit="Mts" />
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", marginTop: 6, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Auto-Calculated</div>
                <CV label="No. of Modules"   val={calc.noOfModules}  unit="No.s" />
                <CV label="No. of Strings"   val={calc.noOfStrings}  unit="Strings" />
                <CV label="DC Cable Total"   val={calc.dcCableTotal} unit="Mts (×1.2 safety)" />
                <CV label="→ 4 Sq.mm Share" val={calc.dcCable4}     unit="Mts" />
                <CV label="→ 6 Sq.mm Share" val={calc.dcCable6}     unit="Mts" />
              </div>
            </Card>

            {/* DCDB */}
            <Card title="DCDB Configuration" icon={<Zap size={15} />}>
              <SF label="DCDB Required?" val={inp.dcdbRequired} set={v => setI("dcdbRequired", v)} opts={["YES", "NO"]} />
              {inp.dcdbRequired === "YES" && inp.inv.map((iv, idx) => (
                <div key={idx} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 3 }}>
                    Inv {idx + 1} ({iv.nos} No.s × {iv.size} KW)
                  </div>
                  <select value={inp.dcdbSize[idx]}
                    onChange={e => { const d = [...inp.dcdbSize]; d[idx] = e.target.value; setI("dcdbSize", d); }}
                    style={{ width: "100%", padding: "6px 10px", fontSize: 12, background: "#fff8e7", border: "2px solid #f5c842", borderRadius: 6 }}>
                    {DCDB_OPTS.map(o => <option key={o} value={o}>{o} with DC SPD & MCB</option>)}
                  </select>
                </div>
              ))}
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: 10, marginTop: 8 }}>
                {Object.entries(calc.dcdbQty).filter(([,v]) => v > 0).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0" }}>
                    <span style={{ color: "#64748b" }}>{k}</span><b style={{ fontFamily: "monospace" }}>{v} No.s</b>
                  </div>
                ))}
                {Object.values(calc.dcdbQty).every(v => v === 0) && <span style={{ fontSize: 11, color: "#94a3b8" }}>None active</span>}
              </div>
            </Card>

            {/* AC Sizing */}
            <Card title="AC Sizing — Inverter Groups" icon={<Calculator size={15} />}>
              {inp.inv.map((iv, idx) => (
                <div key={idx} style={{ marginBottom: 12, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#0d1b2a", marginBottom: 8 }}>Inverter Group {idx + 1}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                    <NF label="Size"  val={iv.size}      set={v => setInv(idx, "size", v)}      unit="KW" />
                    <NF label="No.s"  val={iv.nos}       set={v => setInv(idx, "nos", v)}       unit="" />
                    <NF label="Avg Length → ACDB" val={iv.toACDBLen} set={v => setInv(idx, "toACDBLen", v)} unit="Mts" />
                    <NF label="Runs"  val={iv.runs}      set={v => setInv(idx, "runs", v)}      unit="" />
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 3 }}>Cable Size (Inv → ACDB)</div>
                    <select value={iv.cableSize} onChange={e => setInv(idx, "cableSize", parseInt(e.target.value))}
                      style={{ width: "100%", padding: "6px 10px", fontSize: 12, background: "#fff8e7", border: "2px solid #f5c842", borderRadius: 6 }}>
                      {CABLE_SIZES.map(s => <option key={s} value={s}>{s} Sq.mm</option>)}
                    </select>
                  </div>
                  {calc.invCalc[idx] && (
                    <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#64748b", marginTop: 6, flexWrap: "wrap" }}>
                      <span>I = <b style={{ fontFamily: "monospace" }}>{fmt(calc.invCalc[idx].I, 1)} A</b></span>
                      <span>V-Loss = <b style={{ fontFamily: "monospace", color: calc.invCalc[idx].VL > 2 ? "#ef4444" : "#22c55e" }}>{fmt(calc.invCalc[idx].VL, 2)}%</b></span>
                    </div>
                  )}
                </div>
              ))}
              <div style={{ background: "#f0fdf4", borderRadius: 6, padding: 10, border: "1px solid #bbf7d0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span>Total Capacity</span>
                  <b style={{ fontFamily: "monospace" }}>{fmt(calc.totalKW)} KW ({calc.totalInv} Inverters)</b>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
                  <span>DC/AC Ratio</span>
                  <b style={{ fontFamily: "monospace", color: calc.ratio > 1.5 ? "#ef4444" : "#22c55e" }}>{fmt(calc.ratio, 3)}</b>
                </div>
              </div>
            </Card>

            {/* ACDB */}
            <Card title="ACDB Configuration" icon={<Calculator size={15} />}>
              {inp.acdb.map((a, idx) => (
                <div key={idx} style={{ marginBottom: 12, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#0d1b2a", marginBottom: 8 }}>ACDB {idx + 1}</div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 3 }}>Type</div>
                    <select value={a.type} onChange={e => setAcdb(idx, "type", e.target.value)}
                      style={{ width: "100%", padding: "6px 10px", fontSize: 12, background: "#fff8e7", border: "2px solid #f5c842", borderRadius: 6 }}>
                      <option value="">— None —</option>
                      {ACDB_OPTS.map(o => <option key={o} value={o}>{o} LT Panel MCCB Type II SPD</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 8px" }}>
                    <NF label="No.s"     val={a.nos}    set={v => setAcdb(idx, "nos", v)}    unit="" />
                    <NF label="Len to LT Panel" val={a.toLen}  set={v => setAcdb(idx, "toLen", v)}  unit="Mts" />
                    <NF label="Runs"     val={a.runs}   set={v => setAcdb(idx, "runs", v)}   unit="" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 3 }}>Cable Size (ACDB → LT Panel)</div>
                    <select value={a.cableSize} onChange={e => setAcdb(idx, "cableSize", parseInt(e.target.value))}
                      style={{ width: "100%", padding: "6px 10px", fontSize: 12, background: "#fff8e7", border: "2px solid #f5c842", borderRadius: 6 }}>
                      {CABLE_SIZES.map(s => <option key={s} value={s}>{s} Sq.mm</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </Card>

            {/* MMS */}
            <Card title="Module Mounting Structure (KW Allocation)" icon={<Zap size={15} />}>
              {STRUCTURES.map((s, i) => (
                <div key={s.key} style={{ display: "grid", gridTemplateColumns: "1fr 90px", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#0d1b2a", fontWeight: 500 }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>₹{fmt(s.ratePerKW)}/KW + 18% GST</div>
                  </div>
                  <input type="number" value={inp.structures[i]} min={0}
                    onChange={e => setStr(i, e.target.value)}
                    style={{ padding: "5px 8px", fontSize: 13, fontFamily: "monospace", background: "#fff8e7", border: "2px solid #f5c842", borderRadius: 6, textAlign: "right" }} />
                </div>
              ))}
              <div style={{ background: "#f0fdf4", borderRadius: 6, padding: 8, marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span>Total Allocated</span>
                <b style={{ fontFamily: "monospace", color: inp.structures.reduce((a,b)=>a+b,0) === inp.systemSize ? "#22c55e" : "#ef4444" }}>
                  {fmt(inp.structures.reduce((a,b)=>a+b,0))} / {inp.systemSize} KW
                </b>
              </div>
            </Card>

            {/* Safety + Earthing + Rates */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card title="Safety" icon={<Shield size={15} />}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                  <NF label="Walkway"          val={inp.walkwayMts}        set={v => setI("walkwayMts", v)}        unit="Mts" />
                  <NF label="Guard Rail"       val={inp.guardRailMts}      set={v => setI("guardRailMts", v)}      unit="Mts" />
                  <NF label="Lifeline (₹ lump sum)" val={inp.safetyLifelineCost} set={v => setI("safetyLifelineCost", v)} unit="₹" />
                  <NF label="Fire Extinguishers" val={inp.fireExtQty}      set={v => setI("fireExtQty", v)}        unit="No.s" />
                </div>
              </Card>
              <Card title="Earthing & Lightning" icon={<Zap size={15} />}>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                  <CV label="Earth Rods DC (1 per 100KWp)" val={calc.earthRodDC}  unit="No.s" />
                  <CV label="Earth Pipes AC (1 per Inv+ACDB)" val={calc.earthPipeAC} unit="No.s" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                  <NF label="ESE Lightning Arrester"   val={inp.eseLA}   set={v => setI("eseLA", v)}   unit="No.s" />
                  <NF label="Spike Lightning Arrester" val={inp.spikeLA} set={v => setI("spikeLA", v)} unit="No.s" />
                </div>
              </Card>
              <Card title="BOS / I&C / Liaisoning">
                <SF label="BOS Type" val={inp.bosType} set={v => setI("bosType", v)} opts={["Premium","Economy","Tight"]} />
                <div style={{ fontSize: 11, color: "#64748b", marginTop: -6, marginBottom: 8 }}>Rate: ₹{calc.bosRate}/KWp → {fmtRs(calc.bosRate * inp.systemSize)}</div>
                <SF label="I&C Type" val={inp.incType} set={v => setI("incType", v)} opts={["Premium","Economy","Tight"]} />
                <div style={{ fontSize: 11, color: "#64748b", marginTop: -6, marginBottom: 8 }}>Rate: ₹{calc.incRate}/KWp → {fmtRs(calc.incRate * inp.systemSize)}</div>
                <SF label="Liaisoning State" val={inp.liaisoningState} set={v => setI("liaisoningState", v)} opts={Object.keys(LIAISONING_RATES)} />
                <div style={{ fontSize: 11, color: "#64748b", marginTop: -6 }}>Rate: ₹{calc.liaRate}/KWp → {fmtRs(calc.liaRate * inp.systemSize)}</div>
              </Card>
            </div>

          </div>
        )}

        {/* ═══ BOQ TAB ═══ */}
        {tab === "boq" && (
          <div>
            <div style={{ marginBottom: 10, padding: "8px 14px", background: "#fef9c3", borderRadius: 8, fontSize: 12, color: "#854d0e", border: "1px solid #fde68a" }}>
              🟡 <b>Amber qty</b> = auto-filled from Design Inputs &nbsp;|&nbsp; ✏️ <b>White cells</b> = enter manually
            </div>

            {/* MMS */}
            <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "#0d1b2a", cursor: "pointer" }}
                onClick={() => setCol(p => ({ ...p, MMS: !p.MMS }))}>
                <span style={{ color: "#f5a623", fontWeight: 700, fontSize: 13 }}>Module Mounting Structure</span>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>{collapsed.MMS ? "▶" : "▼"}</span>
              </div>
              {!collapsed.MMS && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        {["#","Structure Type","KW (auto)","Rate/KW","Basic","GST @18%","Total"].map(h => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: ["KW (auto)","Rate/KW","Basic","GST @18%","Total"].includes(h) ? "right" : "left", fontSize: 11, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {STRUCTURES.map((s, i) => {
                        const kw = inp.structures[i] || 0;
                        const b = kw * s.ratePerKW; const g = b * 0.18;
                        return (
                          <tr key={s.key} style={{ borderBottom: "1px solid #f8fafc", background: kw > 0 ? "#f0fdf4" : "white" }}>
                            <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{i + 1}</td>
                            <td style={{ padding: "8px 12px", color: "#0d1b2a", fontWeight: 500 }}>{s.label}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#0d1b2a", background: "#fff8e7" }}>{kw}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace" }}>₹{fmt(s.ratePerKW)}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace" }}>₹{fmt(b)}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace", color: "#64748b" }}>₹{fmt(g)}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>₹{fmt(b+g)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* All sections */}
            {BOQ_SECTIONS.map(sec => {
              const items = BOQ_CATALOG.filter(i => i.sec === sec);
              const secTotal = items.reduce((s, item) => {
                const { qty, cpu } = getEffective(item, inp, calc, boqManual);
                return s + qty * cpu * (1 + item.gst);
              }, 0);
              return (
                <div key={sec} style={{ borderRadius: 10, overflow: "hidden", marginBottom: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "#0d1b2a", cursor: "pointer" }}
                    onClick={() => setCol(p => ({ ...p, [sec]: !p[sec] }))}>
                    <span style={{ color: "#f5a623", fontWeight: 700, fontSize: 13 }}>{sec}</span>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      {secTotal > 0 && <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "monospace" }}>{fmtRs(secTotal)}</span>}
                      <span style={{ color: "#94a3b8", fontSize: 11 }}>{collapsed[sec] ? "▶" : "▼"}</span>
                    </div>
                  </div>
                  {!collapsed[sec] && (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 860 }}>
                        <thead>
                          <tr style={{ background: "#f1f5f9" }}>
                            {["S.No","Category","Specification","Cls","Unit","Qty","Cost/Unit","GST","Total"].map(h => (
                              <th key={h} style={{ padding: "8px 12px", textAlign: ["Qty","Cost/Unit","Total"].includes(h) ? "right" : "left", fontSize: 11, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, ri) => {
                            const { qty, cpu, autoQty: aq, autoCpu: ac } = getEffective(item, inp, calc, boqManual);
                            const basic = qty * cpu; const total = basic * (1 + item.gst);
                            return (
                              <tr key={item.id} style={{ borderBottom: "1px solid #f8fafc", background: ri % 2 === 0 ? "white" : "#fafbfc" }}>
                                <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{item.id}</td>
                                <td style={{ padding: "8px 12px", fontWeight: 600, color: "#0d1b2a" }}>{item.name}</td>
                                <td style={{ padding: "8px 12px", color: "#64748b", fontSize: 11, maxWidth: 220 }}>
                                  {item.spec}
                                  {item.brands && <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 1 }}>{item.brands}</div>}
                                </td>
                                <td style={{ padding: "8px 12px" }}>{clsBadge(item.cls)}</td>
                                <td style={{ padding: "8px 12px", color: "#64748b" }}>{item.unit}</td>
                                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                                  {aq
                                    ? <span style={{ fontFamily: "monospace", fontWeight: 700, background: "#fff8e7", padding: "2px 7px", borderRadius: 4 }}>{fmt(qty, 2)}</span>
                                    : <input type="number" value={boqManual[item.id]?.qty || ""} min={0} placeholder="0"
                                        onChange={e => setMan(item.id, "qty", e.target.value)}
                                        style={{ width: 72, padding: "4px 6px", fontSize: 12, fontFamily: "monospace", textAlign: "right", background: "white", border: "1px solid #e2e8f0", borderRadius: 4, outline: "none" }} />
                                  }
                                </td>
                                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                                  {ac
                                    ? <span style={{ fontFamily: "monospace", color: "#64748b", background: "#fff8e7", padding: "2px 7px", borderRadius: 4 }}>{fmt(cpu)}</span>
                                    : <input type="number" value={boqManual[item.id]?.cpu || ""} min={0} placeholder="0"
                                        onChange={e => setMan(item.id, "cpu", e.target.value)}
                                        style={{ width: 82, padding: "4px 6px", fontSize: 12, fontFamily: "monospace", textAlign: "right", background: "white", border: "1px solid #e2e8f0", borderRadius: 4, outline: "none" }} />
                                  }
                                </td>
                                <td style={{ padding: "8px 12px", textAlign: "center", color: "#64748b", fontSize: 11 }}>{(item.gst * 100).toFixed(0)}%</td>
                                <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: total > 0 ? 700 : 400, color: total > 0 ? "#0d1b2a" : "#94a3b8" }}>
                                  {total > 0 ? fmtRs(total) : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ SUMMARY TAB ═══ */}
        {tab === "summary" && (
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0d1b2a", marginBottom: 20 }}>Design Summary — {project.project_name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { l: "System Size",    v: `${inp.systemSize} KWp` },
                  { l: "Modules",        v: `${fmt(calc.noOfModules)} No.s` },
                  { l: "Inverters",      v: `${calc.totalInv} No.s (${calc.totalKW} KW)` },
                  { l: "DC/AC Ratio",    v: fmt(calc.ratio, 3) },
                  { l: "DC Cable",       v: `${fmt(calc.dcCableTotal, 0)} Mts` },
                  { l: "Total ACDB",     v: `${calc.totalACDB} No.s` },
                ].map(k => (
                  <div key={k.l} style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{k.l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: "#0d1b2a" }}>{k.v}</div>
                  </div>
                ))}
              </div>

              {(() => {
                const rows = [];
                let mmsB = STRUCTURES.reduce((s,st,i) => s + (inp.structures[i]||0)*st.ratePerKW, 0);
                let mmsG = mmsB * 0.18;
                if (mmsB > 0) rows.push({ l: "Module Mounting Structure", b: mmsB, g: mmsG });
                BOQ_SECTIONS.forEach(sec => {
                  let b = 0, g = 0;
                  BOQ_CATALOG.filter(i => i.sec === sec).forEach(item => {
                    const { qty, cpu } = getEffective(item, inp, calc, boqManual);
                    b += qty * cpu; g += qty * cpu * item.gst;
                  });
                  if (b > 0) rows.push({ l: sec, b, g });
                });
                const tB = rows.reduce((s,r) => s+r.b, 0);
                const tG = rows.reduce((s,r) => s+r.g, 0);
                return (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#0d1b2a" }}>
                        {["Cost Head","Basic Amount","GST","Total (incl. GST)"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: h === "Cost Head" ? "left" : "right", color: "#f5a623", fontSize: 12, fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={r.l} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                          <td style={{ padding: "10px 16px", color: "#0d1b2a", fontWeight: 500 }}>{r.l}</td>
                          <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: "monospace", color: "#475569" }}>{fmtRs(r.b)}</td>
                          <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: "monospace", color: "#94a3b8" }}>{fmtRs(r.g)}</td>
                          <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>{fmtRs(r.b+r.g)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: "#0d1b2a" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "white" }}>GRAND TOTAL</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", color: "#94a3b8" }}>{fmtRs(tB)}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", color: "#94a3b8" }}>{fmtRs(tG)}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#f5a623", fontSize: 16 }}>{fmtRs(totals.grand)}</td>
                      </tr>
                      <tr style={{ background: "#0a1520" }}>
                        <td colSpan={4} style={{ padding: "8px 16px", textAlign: "right", color: "#64748b", fontSize: 12, fontFamily: "monospace" }}>
                          ₹{fmt(inp.systemSize > 0 ? totals.grand / inp.systemSize : 0)} / KWp
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
