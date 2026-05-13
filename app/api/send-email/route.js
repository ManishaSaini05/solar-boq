import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Reusable transporter — uses your SMTP credentials from .env.local
function getTransporter() {
  return nodemailer.createTransporter({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Email templates per stage transition
function buildEmail(type, project) {
  const templates = {
    // Design team notified when project is created
    design: {
      subject: `[Solar BoQ] New Project Assigned — ${project.project_name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0d1b2a;padding:20px;border-radius:8px 8px 0 0">
            <h2 style="color:#f5a623;margin:0">Solar BoQ System</h2>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
            <p>Hi Design Team,</p>
            <p>A new project has been assigned for BoQ preparation:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;color:#64748b;font-size:13px">Project</td><td style="padding:8px;font-weight:600">${project.project_name}</td></tr>
              <tr style="background:#f8fafc"><td style="padding:8px;color:#64748b;font-size:13px">Client</td><td style="padding:8px">${project.client_name}</td></tr>
              <tr><td style="padding:8px;color:#64748b;font-size:13px">Location</td><td style="padding:8px">${project.site_location || "—"}</td></tr>
            </table>
            <a href="${APP_URL}/project/${project.id}/design"
               style="display:inline-block;background:#f5a623;color:#0d1b2a;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none">
              Open BoQ Designer →
            </a>
          </div>
        </div>`,
    },

    // CFO notified when design is complete
    cfo: {
      subject: `[Solar BoQ] BoQ Ready for Margin Approval — ${project.project_name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0d1b2a;padding:20px;border-radius:8px 8px 0 0">
            <h2 style="color:#f5a623;margin:0">Solar BoQ System</h2>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
            <p>Hi,</p>
            <p>The Bill of Quantities for <strong>${project.project_name}</strong> is ready for your gross margin input.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;color:#64748b;font-size:13px">Client</td><td style="padding:8px">${project.client_name}</td></tr>
              <tr style="background:#f8fafc"><td style="padding:8px;color:#64748b;font-size:13px">System Size</td><td style="padding:8px">${project.design_inputs?.systemSize || "—"} KWp</td></tr>
              <tr><td style="padding:8px;color:#64748b;font-size:13px">Base Cost</td><td style="padding:8px;font-weight:600">₹${Number(project.boq_total || 0).toLocaleString("en-IN")}</td></tr>
            </table>
            <a href="${APP_URL}/project/${project.id}/cfo"
               style="display:inline-block;background:#f5a623;color:#0d1b2a;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none">
              Enter Gross Margin →
            </a>
          </div>
        </div>`,
    },

    // Finance team notified when CFO approves
    finance: {
      subject: `[Solar BoQ] CFO Approved — Finance Analysis Required — ${project.project_name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0d1b2a;padding:20px;border-radius:8px 8px 0 0">
            <h2 style="color:#f5a623;margin:0">Solar BoQ System</h2>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
            <p>Hi Finance Team,</p>
            <p>The gross margin for <strong>${project.project_name}</strong> has been approved by the CFO. Please complete the financial analysis.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;color:#64748b;font-size:13px">Client</td><td style="padding:8px">${project.client_name}</td></tr>
              <tr style="background:#f8fafc"><td style="padding:8px;color:#64748b;font-size:13px">Gross Margin</td><td style="padding:8px;font-weight:600;color:#22c55e">${project.gross_margin}%</td></tr>
              <tr><td style="padding:8px;color:#64748b;font-size:13px">Base BoQ Cost</td><td style="padding:8px">₹${Number(project.boq_total || 0).toLocaleString("en-IN")}</td></tr>
            </table>
            <a href="${APP_URL}/project/${project.id}/finance"
               style="display:inline-block;background:#f5a623;color:#0d1b2a;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none">
              Open Finance Analysis →
            </a>
          </div>
        </div>`,
    },
  };

  return templates[type];
}

// POST /api/send-email
export async function POST(req) {
  const body = await req.json();
  const { type, to, project } = body;

  if (!type || !to || !project) {
    return NextResponse.json({ error: "Missing type, to, or project" }, { status: 400 });
  }

  const template = buildEmail(type, project);
  if (!template) {
    return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from:    `"Solar BoQ System" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html:    template.html,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
