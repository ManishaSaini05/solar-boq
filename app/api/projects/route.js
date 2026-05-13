import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

// GET /api/projects — list all projects
export async function GET() {
  const { data, error } = await supabase
    .from("projects")
    .select("id, project_name, client_name, site_location, stage, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/projects — create new project
export async function POST(req) {
  const body = await req.json();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      project_name:       body.project_name,
      client_name:        body.client_name,
      client_email:       body.client_email,
      site_location:      body.site_location,
      design_team_email:  body.design_team_email,
      cfo_email:          body.cfo_email,
      finance_team_email: body.finance_team_email,
      stage:              1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
