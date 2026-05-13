import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import { runDesignCalcs, getEffective } from "@/lib/calculations";
import { STRUCTURES, BOQ_CATALOG, BOQ_SECTIONS } from "@/lib/boqData";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing project id" }, { status: 400 });

  // Fetch project
  const { data: project, error } = await supabase
    .from("projects").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const inp       = project.design_inputs  || {};
  const boqManual = project.boq_manual     || {};
  const calc      = runDesignCalcs(inp);

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary ─────────────────────────────────────────────────────
  const summaryRows = [
    ["SOLAR ROOFTOP PROJECT — BILL OF QUANTITIES"],
    [],
    ["Project Name", project.project_name],
    ["Client",       project.client_name],
    ["Location",     project.site_location],
    ["System Size",  `${inp.systemSize} KWp`],
    ["Generated",    new Date().toLocaleDateString("en-IN")],
    [],
    ["Cost Head", "Basic Amount (₹)", "GST (₹)", "Total (₹)"],
  ];

  let totalBasic = 0, totalGST = 0;

  // MMS rows
  let mmsBasic = 0, mmsGST = 0;
  STRUCTURES.forEach((s, i) => {
    const kw  = inp.structures?.[i] || 0;
    const b   = kw * s.ratePerKW;
    const g   = b * 0.18;
    mmsBasic += b; mmsGST += g;
  });
  if (mmsBasic > 0) summaryRows.push(["Module Mounting Structure", mmsBasic, mmsGST, mmsBasic + mmsGST]);

  BOQ_SECTIONS.forEach(sec => {
    let secBasic = 0, secGST = 0;
    BOQ_CATALOG.filter(i => i.sec === sec).forEach(item => {
      const { qty, cpu } = getEffective(item, inp, calc, boqManual);
      const b = qty * cpu;
      secBasic += b; secGST += b * item.gst;
    });
    if (secBasic > 0) summaryRows.push([sec, secBasic, secGST, secBasic + secGST]);
    totalBasic += secBasic; totalGST += secGST;
  });

  totalBasic += mmsBasic; totalGST += mmsGST;
  summaryRows.push([], ["GRAND TOTAL", totalBasic, totalGST, totalBasic + totalGST]);

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // ── Sheet 2: Full BoQ ─────────────────────────────────────────────────────
  const boqRows = [
    ["S.No", "Cost Head", "Equipment", "Specification", "Class", "Unit", "Qty", "Cost/Unit (₹)", "Basic Amount (₹)", "GST Rate", "Total Amount (₹)"],
  ];

  let sno = 1;

  // MMS rows first
  STRUCTURES.forEach((s, i) => {
    const kw  = inp.structures?.[i] || 0;
    if (kw > 0) {
      const b = kw * s.ratePerKW;
      const g = b * 0.18;
      boqRows.push([sno++, "MMS", s.label, "As per specification", "A", "KW", kw, s.ratePerKW, b, "18%", b + g]);
    }
  });

  BOQ_CATALOG.forEach(item => {
    const { qty, cpu } = getEffective(item, inp, calc, boqManual);
    const b = qty * cpu;
    const g = b * item.gst;
    boqRows.push([
      sno++, item.sec, item.name, item.spec, item.cls,
      item.unit, qty || "", cpu || "", b || "", `${(item.gst * 100).toFixed(0)}%`, (b + g) || "",
    ]);
  });

  const wsBoQ = XLSX.utils.aoa_to_sheet(boqRows);
  wsBoQ["!cols"] = [
    { wch: 6 }, { wch: 28 }, { wch: 30 }, { wch: 50 },
    { wch: 6 }, { wch: 8  }, { wch: 10 }, { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsBoQ, "Bill of Quantities");

  // ── Sheet 3: Design Inputs ────────────────────────────────────────────────
  const designRows = [
    ["DESIGN PARAMETERS"],
    [],
    ["System Size",           inp.systemSize, "KWp"],
    ["Module Size",           inp.moduleSize,  "Wp"],
    ["No. of Modules",        calc.noOfModules, "No.s (auto)"],
    ["Average String Size",   inp.avgStringSize, "Panels"],
    ["No. of Strings",        calc.noOfStrings,  "Strings (auto)"],
    ["Longest String Length", inp.longestStringLength, "Mts"],
    ["DC Cable Required",     Math.round(calc.dcCableTotal), "Mts (auto, incl. 20% factor)"],
    [],
    ["AC SIZING"],
    ["Inverter Group", "Size (KW)", "No.s", "Avg Length to ACDB (Mts)", "Cable Size", "Runs"],
    ...inp.inv?.map((iv, i) => [`Group ${i + 1}`, iv.size, iv.nos, iv.toACDBLen, `${iv.cableSize} Sq.mm`, iv.runs]) || [],
    [],
    ["Total Inverter Capacity", calc.totalKW, "KW"],
    ["Total Inverters",         calc.totalInv, "No.s"],
    ["DC / AC Ratio",           calc.ratio?.toFixed(3)],
    [],
    ["BOS Type",        inp.bosType,  `₹${calc.bosRate}/KWp`],
    ["I&C Type",        inp.incType,  `₹${calc.incRate}/KWp`],
    ["Liaisoning State",inp.liaisoningState, `₹${calc.liaRate}/KWp`],
  ];

  const wsDesign = XLSX.utils.aoa_to_sheet(designRows);
  wsDesign["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 16 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsDesign, "Design Inputs");

  // Build response
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const fileName = `BoQ_${project.project_name?.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
