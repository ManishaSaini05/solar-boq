import { supabase } from "@/lib/supabase";
import CFOView from "@/components/CFOView";
import StageNav from "@/components/StageNav";

export const revalidate = 0;

export default async function CFOPage({ params }) {
  const { data: project } = await supabase
    .from("projects").select("*").eq("id", params.id).single();

  if (!project) return <div style={{ padding: 40 }}>Project not found.</div>;

  if (project.stage < 2) {
    return (
      <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
        <StageNav projectId={params.id} currentStage={3} completedStage={project.stage} projectName={project.project_name} />
        <div style={{ maxWidth: 500, margin: "60px auto", padding: 32, background: "white", borderRadius: 12, textAlign: "center", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 700, color: "#0d1b2a", marginBottom: 8 }}>Design not yet complete</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>The design team must complete and submit the BoQ before CFO approval.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <StageNav projectId={params.id} currentStage={3} completedStage={project.stage} projectName={project.project_name} />
      <CFOView projectId={params.id} project={project} />
    </div>
  );
}
