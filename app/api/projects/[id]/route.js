import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

// GET /api/projects/[id]
export async function GET(req, { params }) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PUT /api/projects/[id] — update project (any stage data)
export async function PUT(req, { params }) {
  const body = await req.json();

  const { data, error } = await supabase
    .from("projects")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
