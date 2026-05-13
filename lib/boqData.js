// ─── LOOKUP TABLES (from Excel far-right reference columns) ───────────────────

export const CABLE_RESISTANCE = {
  2.5: 9.45, 4: 5.88, 6: 3.93, 10: 2.33, 16: 2.44, 25: 1.54,
  35: 1.11, 50: 0.82, 70: 0.568, 95: 0.41, 120: 0.325, 150: 0.264,
  185: 0.211, 240: 0.161, 300: 0.129, 400: 0.101,
};

export const BOS_RATES    = { Premium: 1000, Economy: 800, Tight: 600 };
export const INC_RATES    = { Premium: 1800, Economy: 1500, Tight: 1200 };
export const LIAISONING_RATES = {
  "Telangana": 600, "Andhra Pradesh": 800, "Karnataka": 800,
  "Tamil Nadu": 1000, "Maharashtra": 1000, "Kerala": 1000,
  "Gujarat": 1000, "Uttar Pradesh": 1000, "Odisha": 1000,
  "Himachal Pradesh": 1000, "Delhi NCR": 1000, "Madhya Pradesh": 1000,
  "Haryana": 1000, "Punjab": 1000,
};

export const CABLE_SIZES  = [16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400];
export const DCDB_OPTS    = ["6 in 6 out", "8 in 8 out", "12 in 12 out", "16 in 16 out", "20 in 20 out"];
export const ACDB_OPTS    = ["1 in 1 out", "2 in 1 out", "3 in 1 out", "4 in 1 out",
                              "5 in 1 out", "6 in 1 out", "7 in 1 out", "8 in 1 out"];

// ─── STRUCTURE TYPES ──────────────────────────────────────────────────────────
export const STRUCTURES = [
  { key: "s1", label: "HDGI Flat Roof – Normal Height",            ratePerKW: 3250 },
  { key: "s2", label: "Magnelis Flat Roof – Normal Height",        ratePerKW: 3000 },
  { key: "s3", label: "Pre-GI Flat Roof – Normal Height",          ratePerKW: 3000 },
  { key: "s4", label: "HDGI Flat Roof – Superstructure",           ratePerKW: 7000 },
  { key: "s5", label: "Magnelis Flat Roof – Superstructure",       ratePerKW: 6800 },
  { key: "s6", label: "Pre-GI Flat Roof – Superstructure",         ratePerKW: 6800 },
  { key: "s7", label: "Al Short Rail Shed (300×150×100)",          ratePerKW:  900 },
  { key: "s8", label: "Magnelis Short Rail Shed (300×150×100)",    ratePerKW:  850 },
  { key: "s9", label: "Single Axis Tracking System",               ratePerKW:    0 },
];

// ─── BOQ ITEM CATALOG ─────────────────────────────────────────────────────────
// calcKey = auto-populated from design params; no calcKey = manual entry
export const BOQ_CATALOG = [
  // PV Module
  { id:1,  sec:"PV Module",      name:"Solar PV Panel",                spec:"TOPCon Bifacial, IEC 61215-2/61730-2, Min 21.5% eff.",                cls:"A", unit:"No.s",  gst:0.05, calcKey:"modules",    brands:"Jinko / Longi / Risen" },
  { id:2,  sec:"PV Module",      name:"PV Module Optimiser",           spec:"For diff. azimuths / inclination angles",                            cls:"A", unit:"No.s",  gst:0.05,                         brands:"SolarEdge / Huawei" },
  // Inverter
  { id:3,  sec:"Inverter",       name:"String Inverter 350KW 800V HV", spec:"With Built-in Type II SPD",                                         cls:"A", unit:"No.s",  gst:0.05,                         brands:"Sungrow / Solis / Solplanet" },
  { id:4,  sec:"Inverter",       name:"String Inverter 320KW 800V HV", spec:"With Built-in Type II SPD",                                         cls:"A", unit:"No.s",  gst:0.05,                         brands:"Sungrow / Solis / Solplanet" },
  { id:5,  sec:"Inverter",       name:"String Inverter 300KW 690V HV", spec:"With Built-in Type II SPD",                                         cls:"A", unit:"No.s",  gst:0.05,                         brands:"Sungrow / Solis / Solplanet" },
  { id:6,  sec:"Inverter",       name:"String Inverter 150KW 400V",    spec:"With Built-in Type II SPD",                                         cls:"A", unit:"No.s",  gst:0.05,                         brands:"Sungrow / Solis / Solplanet" },
  { id:7,  sec:"Inverter",       name:"String Inverter 125KW 400V",    spec:"With Built-in Type II SPD",                                         cls:"A", unit:"No.s",  gst:0.05,                         brands:"Sungrow / Solis / GoodWe" },
  { id:8,  sec:"Inverter",       name:"String Inverter 100KW 400V",    spec:"With Built-in Type II SPD",                                         cls:"A", unit:"No.s",  gst:0.05,                         brands:"Sungrow / Solis / GoodWe" },
  { id:9,  sec:"Inverter",       name:"String Inverter 75KW 400V",     spec:"With Built-in Type II SPD",                                         cls:"A", unit:"No.s",  gst:0.05,                         brands:"Sungrow / Solis / GoodWe" },
  { id:10, sec:"Inverter",       name:"String Inverter 50KW 400V",     spec:"With Built-in Type II SPD",                                         cls:"A", unit:"No.s",  gst:0.05,                         brands:"Sungrow / Solis / GoodWe" },
  { id:11, sec:"Inverter",       name:"String Inverter 33KW 400V",     spec:"With Built-in Type II SPD",                                         cls:"A", unit:"No.s",  gst:0.05,                         brands:"Sungrow / Solis / GoodWe" },
  { id:12, sec:"Inverter",       name:"String Inverter 20KW 400V",     spec:"With Built-in Type II SPD",                                         cls:"A", unit:"No.s",  gst:0.05,                         brands:"Sungrow / Solis / GoodWe" },
  { id:13, sec:"Inverter",       name:"DG Sync Device",                spec:"DG Sync between Inverter and DG",                                   cls:"B", unit:"No.s",  gst:0.18 },
  { id:14, sec:"Inverter",       name:"Export Control Device",         spec:"For Captive Power Plants",                                          cls:"B", unit:"No.s",  gst:0.18 },
  { id:15, sec:"Inverter",       name:"Inverter Mounting Frame",       spec:"With Canopy, Nut, Bolts & Washers",                                 cls:"C", unit:"No.s",  gst:0.18 },
  // DC System
  { id:16, sec:"DC System",      name:"DC Cable 4Sq.mm +ve",           spec:"4Sq.mm XLPO Tinned Cu, BSEN 50618 (Red Stripes)",                  cls:"B", unit:"Mtrs",  gst:0.18, calcKey:"dcCable4",   brands:"Lapp / Apar / Polycab" },
  { id:17, sec:"DC System",      name:"DC Cable 4Sq.mm -ve",           spec:"4Sq.mm XLPO Tinned Cu, BSEN 50618 (Black)",                        cls:"B", unit:"Mtrs",  gst:0.18, calcKey:"dcCable4",   brands:"Lapp / Apar / Polycab" },
  { id:18, sec:"DC System",      name:"DC Cable 6Sq.mm +ve",           spec:"6Sq.mm XLPO Tinned Cu, BSEN 50618 (Red Stripes)",                  cls:"B", unit:"Mtrs",  gst:0.18, calcKey:"dcCable6",   brands:"Lapp / Apar / Polycab" },
  { id:19, sec:"DC System",      name:"DC Cable 6Sq.mm -ve",           spec:"6Sq.mm XLPO Tinned Cu, BSEN 50618 (Black)",                        cls:"B", unit:"Mtrs",  gst:0.18, calcKey:"dcCable6",   brands:"Lapp / Apar / Polycab" },
  { id:20, sec:"DC System",      name:"MC4 Connector +ve",             spec:"IP68, 1500Vdc, TUV/UL, 4Sq.mm, 50A, IEC62852",                   cls:"B", unit:"No.s",  gst:0.05,                         brands:"Stäubli Evo2 / Stäubli UR" },
  { id:21, sec:"DC System",      name:"MC4 Connector -ve",             spec:"IP68, 1500Vdc, TUV/UL, 4Sq.mm, 50A, IEC62852",                   cls:"B", unit:"No.s",  gst:0.05,                         brands:"Stäubli Evo2 / Stäubli UR" },
  { id:22, sec:"DC System",      name:"DCDB 6in6out",                  spec:"Built-in DC SPD & Fuses/MCB",                                      cls:"B", unit:"No.s",  gst:0.18, calcKey:"dcdb6" },
  { id:23, sec:"DC System",      name:"DCDB 8in8out",                  spec:"Built-in DC SPD & Fuses/MCB",                                      cls:"B", unit:"No.s",  gst:0.18, calcKey:"dcdb8" },
  { id:24, sec:"DC System",      name:"DCDB 12in12out",                spec:"Built-in DC SPD & Fuses/MCB",                                      cls:"B", unit:"No.s",  gst:0.18, calcKey:"dcdb12" },
  { id:25, sec:"DC System",      name:"DCDB 16in16out",                spec:"Built-in DC SPD & Fuses/MCB",                                      cls:"B", unit:"No.s",  gst:0.18, calcKey:"dcdb16" },
  { id:26, sec:"DC System",      name:"DCDB 20in20out",                spec:"Built-in DC SPD & Fuses/MCB",                                      cls:"B", unit:"No.s",  gst:0.18, calcKey:"dcdb20" },
  // AC System
  { id:27, sec:"AC System",      name:"ACDB 1in1out",                  spec:"LT Panel MCCB with Built-in Type II SPD",                         cls:"B", unit:"No.s",  gst:0.18, calcKey:"acdb1" },
  { id:28, sec:"AC System",      name:"ACDB 2in1out",                  spec:"LT Panel MCCB with Built-in Type II SPD",                         cls:"B", unit:"No.s",  gst:0.18, calcKey:"acdb2" },
  { id:29, sec:"AC System",      name:"ACDB 3in1out",                  spec:"LT Panel MCCB with Built-in Type II SPD",                         cls:"B", unit:"No.s",  gst:0.18, calcKey:"acdb3" },
  { id:30, sec:"AC System",      name:"ACDB 4in1out",                  spec:"LT Panel MCCB with Built-in Type II SPD",                         cls:"B", unit:"No.s",  gst:0.18, calcKey:"acdb4" },
  { id:31, sec:"AC System",      name:"ACDB 5in1out",                  spec:"LT Panel MCCB with Built-in Type II SPD",                         cls:"B", unit:"No.s",  gst:0.18, calcKey:"acdb5" },
  { id:32, sec:"AC System",      name:"ACDB 6in1out",                  spec:"LT Panel MCCB with Built-in Type II SPD",                         cls:"B", unit:"No.s",  gst:0.18, calcKey:"acdb6" },
  { id:33, sec:"AC System",      name:"ACDB 7in1out",                  spec:"LT Panel MCCB with Built-in Type II SPD",                         cls:"B", unit:"No.s",  gst:0.18, calcKey:"acdb7" },
  { id:34, sec:"AC System",      name:"ACDB 8in1out",                  spec:"LT Panel MCCB with Built-in Type II SPD",                         cls:"B", unit:"No.s",  gst:0.18, calcKey:"acdb8" },
  { id:35, sec:"AC System",      name:"AC Cable 1C×150 Al LT",         spec:"1C×150 Sq.mm XLPE ARMOURED Al, 650/1100V, IS 7098",               cls:"B", unit:"Mtrs",  gst:0.18 },
  { id:36, sec:"AC System",      name:"AC Cable 1C×185 Al LT",         spec:"1C×185 Sq.mm XLPE ARMOURED Al, 650/1100V, IS 7098",               cls:"B", unit:"Mtrs",  gst:0.18 },
  { id:37, sec:"AC System",      name:"AC Cable 1C×240 Al LT",         spec:"1C×240 Sq.mm XLPE ARMOURED Al, 650/1100V, IS 7098",               cls:"B", unit:"Mtrs",  gst:0.18 },
  { id:38, sec:"AC System",      name:"AC Cable 3.5C×95 Al LT",        spec:"3.5C×95 Sq.mm XLPE ARMOURED Al, 650/1100V, IS 7098",              cls:"B", unit:"Mtrs",  gst:0.18 },
  { id:39, sec:"AC System",      name:"AC Cable 3.5C×120 Al LT",       spec:"3.5C×120 Sq.mm XLPE ARMOURED Al, 650/1100V, IS 7098",             cls:"B", unit:"Mtrs",  gst:0.18 },
  { id:40, sec:"AC System",      name:"AC Cable 3.5C×185 Al LT",       spec:"3.5C×185 Sq.mm XLPE ARMOURED Al, 650/1100V, IS 7098",             cls:"B", unit:"Mtrs",  gst:0.18 },
  { id:41, sec:"AC System",      name:"AC Cable 3.5C×240 Al LT",       spec:"3.5C×240 Sq.mm XLPE ARMOURED Al, 650/1100V, IS 7098",             cls:"B", unit:"Mtrs",  gst:0.18 },
  { id:42, sec:"AC System",      name:"AC Cable 3C×120 11kV HT",       spec:"3C×120 Sq.mm 11kV XLPE ARMOURED Al",                              cls:"B", unit:"Mtrs",  gst:0.18 },
  { id:43, sec:"AC System",      name:"AC Cable 3C×185 11kV HT",       spec:"3C×185 Sq.mm 11kV XLPE ARMOURED Al",                              cls:"B", unit:"Mtrs",  gst:0.18 },
  // Safety
  { id:44, sec:"Safety & Protection",   name:"FRP Walkway",            spec:"310mm wide, 25mm thick, 38×38mm grating",                         cls:"B", unit:"Mtrs",  gst:0.18, calcKey:"walkway" },
  { id:45, sec:"Safety & Protection",   name:"Magnelis Walkway",       spec:"Corrugated, 310mm wide, 35mm thick",                              cls:"B", unit:"Mtrs",  gst:0.18 },
  { id:46, sec:"Safety & Protection",   name:"Guard Rail – GI",        spec:"38×38mm vert post, 32mm round rail",                              cls:"B", unit:"Mtrs",  gst:0.18, calcKey:"guardRail" },
  { id:47, sec:"Safety & Protection",   name:"Safety Lifeline System", spec:"SS304, anchor posts, brackets, hooks, harness",                   cls:"B", unit:"No.s",  gst:0.18, calcKey:"lifeline" },
  { id:48, sec:"Safety & Protection",   name:"Fire Extinguisher 9kg",  spec:"A/B/C Type – 9kg with stand (IS:2190:1992)",                      cls:"C", unit:"No.s",  gst:0.18, calcKey:"fireExt" },
  { id:49, sec:"Safety & Protection",   name:"Emergency Stop Button",  spec:"With enclosure, cabling & mounting",                             cls:"C", unit:"No.s",  gst:0.18 },
  // Earthing
  { id:50, sec:"Earthing & Lightning",  name:"Earth Rod Cu 3000mm DC", spec:"17.2mm dia, 3000mm Cu bonded electrode (DC side)",                cls:"C", unit:"No.s",  gst:0.18, calcKey:"earthRodDC" },
  { id:51, sec:"Earthing & Lightning",  name:"Earth Pipe CI 3000mm AC",spec:"100mm dia, 3000mm Cast Iron electrode (AC side)",                 cls:"C", unit:"No.s",  gst:0.18, calcKey:"earthPipeAC" },
  { id:52, sec:"Earthing & Lightning",  name:"Earth Rod Cu LA",        spec:"17.2mm dia, 3000mm Cu bonded electrode (LA side)",                cls:"C", unit:"No.s",  gst:0.18, calcKey:"earthRodLA" },
  { id:53, sec:"Earthing & Lightning",  name:"ESE Lightning Arrester", spec:"ESE Type LA with High Mast",                                      cls:"C", unit:"No.s",  gst:0.18, calcKey:"eseLA" },
  { id:54, sec:"Earthing & Lightning",  name:"Spike Lightning Arrester",spec:"Spike Type LA",                                                  cls:"C", unit:"No.s",  gst:0.18, calcKey:"spikeLA" },
  { id:55, sec:"Earthing & Lightning",  name:"Earth Enhancement Compound",spec:"Bentonite – 25kg bag",                                        cls:"C", unit:"No.s",  gst:0.18 },
  { id:56, sec:"Earthing & Lightning",  name:"Earthing Chamber RCC",   spec:"RCC Type with Lid, 450×450mm",                                   cls:"C", unit:"No.s",  gst:0.18 },
  { id:57, sec:"Earthing & Lightning",  name:"GI Strip 25×3mm",        spec:"Hot Dip Galvanised, 85 micron",                                  cls:"C", unit:"Mtrs",  gst:0.18 },
  { id:58, sec:"Earthing & Lightning",  name:"GI Strip 25×6mm",        spec:"Hot Dip Galvanised, 85 micron",                                  cls:"C", unit:"Mtrs",  gst:0.18 },
  // Monitoring
  { id:59, sec:"Monitoring & Control",  name:"PV Plant SCADA System",  spec:"EWS OWS PPC PQ MFM Console",                                     cls:"B", unit:"No.s",  gst:0.18 },
  { id:60, sec:"Monitoring & Control",  name:"Inverter Monitoring",    spec:"PV Plant Monitoring via Inverter",                                cls:"B", unit:"No.s",  gst:0.18 },
  { id:61, sec:"Monitoring & Control",  name:"Weather Station",        spec:"Pyranometer, Module Temp, Ambient Temp, Anemometer, Rain Gauge", cls:"B", unit:"No.s",  gst:0.18 },
  { id:62, sec:"Monitoring & Control",  name:"CAT 6 Ethernet Cable",   spec:"Communication Cable",                                            cls:"C", unit:"Mtrs",  gst:0.18 },
  { id:63, sec:"Monitoring & Control",  name:"RS485 Cable 2×2×0.75mm²",spec:"Twisted Pair Armoured FR XLPE",                                  cls:"C", unit:"Mtrs",  gst:0.18 },
  // Module Cleaning
  { id:64, sec:"Module Cleaning",       name:"Robotic Dry Cleaning",   spec:"With Rails and Autonomous Robots",                               cls:"B", unit:"No.s",  gst:0.18 },
  { id:65, sec:"Module Cleaning",       name:"High Pressure Pump Set", spec:"For manual cleaning",                                            cls:"C", unit:"No.s",  gst:0.18 },
  { id:66, sec:"Module Cleaning",       name:"Soft Brush Poles 4m",    spec:"Extension piece, soft bristle",                                  cls:"C", unit:"No.s",  gst:0.18 },
  // Miscellaneous
  { id:67, sec:"Miscellaneous",         name:"Net Meter LT/CT Class",  spec:"Class 0.2S, separate cores – DISCOM requirement",                cls:"C", unit:"No.s",  gst:0.18 },
  { id:68, sec:"Miscellaneous",         name:"Solar Generation Meter", spec:"Class 0.2S, separate cores",                                     cls:"C", unit:"No.s",  gst:0.18 },
  { id:69, sec:"Miscellaneous",         name:"CT/PT Appropriate Size", spec:"Class 0.2S, 1 per phase",                                        cls:"C", unit:"No.s",  gst:0.18 },
  { id:70, sec:"Miscellaneous",         name:"BOS – Balance of System",spec:"Conduits, Lugs, Glands, Trays, Cable Ties, Markers & Hardware",  cls:"C", unit:"KW",    gst:0.18, calcKey:"bosCost" },
  // I&C
  { id:71, sec:"Installation & Commissioning", name:"Complete I&C Works",  spec:"Structure, Module Mounting, DC/AC Cables, Earthing & Misc", cls:"S", unit:"KW",    gst:0.18, calcKey:"incCost" },
  { id:72, sec:"Installation & Commissioning", name:"Transport of Materials",spec:"Material transport to site",                              cls:"C", unit:"KW",    gst:0.18 },
  { id:73, sec:"Installation & Commissioning", name:"Equipment Rentals",   spec:"Hydra Cranes, Forklifts etc.",                              cls:"S", unit:"KW",    gst:0.18 },
  { id:74, sec:"Installation & Commissioning", name:"Annual Maintenance",  spec:"AMC of the complete system",                                cls:"S", unit:"KW",    gst:0.18 },
  // Liaisoning
  { id:75, sec:"Liaisoning",            name:"CEIG & DISCOM Liaisoning",spec:"Permissions, CEIG inspection, DISCOM synchronisation",         cls:"S", unit:"KW",    gst:0.18, calcKey:"liaisoningCost" },
];

export const BOQ_SECTIONS = [...new Set(BOQ_CATALOG.map((i) => i.sec))];

// ─── DEFAULT DESIGN INPUTS (matches your Excel sample values) ─────────────────
export const DEFAULT_DESIGN_INPUTS = {
  systemSize: 1000,
  moduleSize: 600,
  avgStringSize: 18,
  longestStringLength: 30,
  dcdbRequired: "YES",
  inv: [
    { size: 150, nos: 3, toACDBLen: 50, cableSize: 120, runs: 1 },
    { size: 100, nos: 2, toACDBLen: 30, cableSize:  95, runs: 1 },
    { size:  50, nos: 2, toACDBLen: 10, cableSize:  35, runs: 1 },
  ],
  dcdbSize: ["20 in 20 out", "12 in 12 out", "8 in 8 out"],
  acdb: [
    { type: "4 in 1 out", nos: 1, toLen: 50, cableSize: 185, runs: 2 },
    { type: "3 in 1 out", nos: 1, toLen: 50, cableSize: 240, runs: 1 },
    { type: "",            nos: 0, toLen:  0, cableSize: 120, runs: 1 },
  ],
  structures: [157, 0, 0, 0, 0, 0, 843, 0, 0],
  walkwayMts: 130,
  guardRailMts: 0,
  safetyLifelineCost: 60000,
  fireExtQty: 4,
  eseLA: 1,
  spikeLA: 0,
  bosType: "Premium",
  incType: "Tight",
  liaisoningState: "Telangana",
};
