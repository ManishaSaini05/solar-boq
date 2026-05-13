import { CABLE_RESISTANCE, BOS_RATES, INC_RATES, LIAISONING_RATES, STRUCTURES, BOQ_CATALOG } from "./boqData";

// ─── CORE DESIGN CALCULATIONS ─────────────────────────────────────────────────
export function runDesignCalcs(inp) {
  const { systemSize: SS, moduleSize: MS, avgStringSize: AS, longestStringLength: LL, inv, acdb,
          walkwayMts, guardRailMts, safetyLifelineCost, fireExtQty, eseLA, spikeLA,
          bosType, incType, liaisoningState } = inp;

  const noOfModules  = Math.ceil((SS * 1000) / MS);
  const noOfStrings  = Math.ceil(noOfModules / AS);
  const dcCableTotal = LL * noOfStrings * 2 * 1.2;
  const dcCable4     = LL < 50  ? dcCableTotal / 2 : 0;
  const dcCable6     = LL >= 50 ? dcCableTotal / 2 : 0;

  const totalKW  = inv.reduce((s, i) => s + i.size * i.nos, 0);
  const totalInv = inv.reduce((s, i) => s + i.nos, 0);
  const ratio    = totalKW > 0 ? SS / totalKW : 0;

  const invCalc = inv.map(i => {
    const I   = (i.size * ratio * 1000) / (415 * 1.732 * 0.9);
    const R   = CABLE_RESISTANCE[i.cableSize] || 0;
    const VL  = totalKW > 0 ? (1.732 * (i.toACDBLen / 1000) * I * R) / (i.runs * 415) * 100 : 0;
    const len = i.toACDBLen * i.nos * i.runs;
    return { ...i, I, R, VL, len };
  });

  const totalACDB = acdb.reduce((s, a) => s + a.nos, 0);

  const earthRodDC  = Math.ceil(SS / 100);
  const earthPipeAC = totalInv + totalACDB;
  const earthRodLA  = eseLA + spikeLA;

  const bosRate  = BOS_RATES[bosType]               || 1000;
  const incRate  = INC_RATES[incType]               || 1200;
  const liaRate  = LIAISONING_RATES[liaisoningState] || 800;

  // DCDB count by size
  const dcdbQty = { "6 in 6 out": 0, "8 in 8 out": 0, "12 in 12 out": 0, "16 in 16 out": 0, "20 in 20 out": 0 };
  if (inp.dcdbRequired === "YES") {
    inp.inv.forEach((iv, idx) => {
      const key = inp.dcdbSize[idx];
      if (dcdbQty[key] !== undefined) dcdbQty[key] += iv.nos;
    });
  }

  // ACDB count by type
  const acdbQty = {};
  ["1 in 1 out","2 in 1 out","3 in 1 out","4 in 1 out","5 in 1 out","6 in 1 out","7 in 1 out","8 in 1 out"]
    .forEach(o => { acdbQty[o] = 0; });
  acdb.forEach(a => { if (a.type && acdbQty[a.type] !== undefined) acdbQty[a.type] += a.nos; });

  return {
    noOfModules, noOfStrings, dcCableTotal, dcCable4, dcCable6,
    totalKW, totalInv, ratio, invCalc, totalACDB,
    earthRodDC, earthPipeAC, earthRodLA,
    bosRate, incRate, liaRate,
    dcdbQty, acdbQty,
    moduleCostPerUnit: MS * 15,
  };
}

// ─── EFFECTIVE QTY AND COST FOR A BOQ ITEM ───────────────────────────────────
export function getEffective(item, inp, calc, boqManual) {
  const m      = boqManual?.[item.id] || {};
  const manQty = parseFloat(m.qty)  || 0;
  const manCpu = parseFloat(m.cpu)  || 0;

  const autoMap = {
    modules:        { qty: calc.noOfModules,              cpu: calc.moduleCostPerUnit },
    dcCable4:       { qty: calc.dcCable4,                 cpu: 49 },
    dcCable6:       { qty: calc.dcCable6,                 cpu: 75 },
    dcdb6:          { qty: calc.dcdbQty["6 in 6 out"],    cpu: 0 },
    dcdb8:          { qty: calc.dcdbQty["8 in 8 out"],    cpu: 0 },
    dcdb12:         { qty: calc.dcdbQty["12 in 12 out"],  cpu: 0 },
    dcdb16:         { qty: calc.dcdbQty["16 in 16 out"],  cpu: 0 },
    dcdb20:         { qty: calc.dcdbQty["20 in 20 out"],  cpu: 0 },
    acdb1:          { qty: calc.acdbQty["1 in 1 out"],    cpu: 0 },
    acdb2:          { qty: calc.acdbQty["2 in 1 out"],    cpu: 0 },
    acdb3:          { qty: calc.acdbQty["3 in 1 out"],    cpu: 0 },
    acdb4:          { qty: calc.acdbQty["4 in 1 out"],    cpu: 0 },
    acdb5:          { qty: calc.acdbQty["5 in 1 out"],    cpu: 0 },
    acdb6:          { qty: calc.acdbQty["6 in 1 out"],    cpu: 0 },
    acdb7:          { qty: calc.acdbQty["7 in 1 out"],    cpu: 0 },
    acdb8:          { qty: calc.acdbQty["8 in 1 out"],    cpu: 0 },
    walkway:        { qty: inp.walkwayMts,                cpu: 0 },
    guardRail:      { qty: inp.guardRailMts,              cpu: 0 },
    lifeline:       { qty: inp.safetyLifelineCost > 0 ? 1 : 0, cpu: inp.safetyLifelineCost },
    fireExt:        { qty: inp.fireExtQty,                cpu: 0 },
    earthRodDC:     { qty: calc.earthRodDC,               cpu: 0 },
    earthPipeAC:    { qty: calc.earthPipeAC,              cpu: 0 },
    earthRodLA:     { qty: calc.earthRodLA,               cpu: 0 },
    eseLA:          { qty: inp.eseLA,                     cpu: 0 },
    spikeLA:        { qty: inp.spikeLA,                   cpu: 0 },
    bosCost:        { qty: inp.systemSize,                cpu: calc.bosRate },
    incCost:        { qty: inp.systemSize,                cpu: calc.incRate },
    liaisoningCost: { qty: inp.systemSize,                cpu: calc.liaRate },
  };

  if (item.calcKey && autoMap[item.calcKey]) {
    const a = autoMap[item.calcKey];
    return {
      qty: a.qty,
      cpu: manCpu > 0 ? manCpu : a.cpu,
      autoQty: true,
      autoCpu: a.cpu > 0 && manCpu === 0,
    };
  }
  return { qty: manQty, cpu: manCpu, autoQty: false, autoCpu: false };
}

// ─── GRAND TOTAL ──────────────────────────────────────────────────────────────
export function computeGrandTotal(inp, calc, boqManual) {
  let basic = 0, gstAmt = 0;

  // MMS (structure types)
  STRUCTURES.forEach((s, i) => {
    const kw  = inp.structures?.[i] || 0;
    const b   = kw * s.ratePerKW;
    basic   += b;
    gstAmt  += b * 0.18;
  });

  // BoQ items
  BOQ_CATALOG.forEach(item => {
    const { qty, cpu } = getEffective(item, inp, calc, boqManual);
    const b   = qty * cpu;
    basic   += b;
    gstAmt  += b * item.gst;
  });

  return { basic, gstAmt, grand: basic + gstAmt };
}

// ─── FINANCE CALCULATIONS ─────────────────────────────────────────────────────
export function computeFinance(finInp, totalCostInclGST) {
  const {
    plantCapacity      = 0,
    annualGenPerKWp    = 0,
    discomTariff       = 0,
    grossMargin        = 0,
    addonSupply        = 0,
    addonInstallation  = 0,
  } = finInp;

  const totalCost        = totalCostInclGST;
  const marginAmount     = totalCost * (grossMargin / 100);
  const finalCost        = totalCost + marginAmount + addonSupply + addonInstallation;
  const costPerKWp       = plantCapacity > 0 ? finalCost / plantCapacity : 0;
  const annualGeneration = plantCapacity * annualGenPerKWp;
  const annualSavings    = annualGeneration * discomTariff;
  const paybackPeriod    = annualSavings > 0 ? finalCost / annualSavings : 0;
  const roi              = finalCost > 0 ? (annualSavings / finalCost) * 100 : 0;

  return {
    totalCost, marginAmount, finalCost, costPerKWp,
    annualGeneration, annualSavings, paybackPeriod, roi,
  };
}

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
export const fmt    = (n, d = 0) => (n != null && !isNaN(n))
  ? n.toLocaleString("en-IN", { maximumFractionDigits: d }) : "—";
export const fmtRs  = (n) => "₹" + fmt(n);
export const fmtPct = (n) => fmt(n, 1) + "%";
