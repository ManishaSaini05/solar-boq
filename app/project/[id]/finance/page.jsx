import { supabase } from "@/lib/supabase";
import FinanceView from "@/components/FinanceView";
import StageNav from "@/components/StageNav";

export const revalidate = 0;

export default async function FinancePage({ params }) {
  const { data: project } = await supabase
    .from("projects").select("*").eq("id", params.id).single();

  if (!project) return <div style={{ padding: 40 }}>Project not found.</div>;

  if (project.stage < 3) {
    return (
      <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
        <StageNav projectId={params.id} currentStage={4} completedStage={project.stage} projectName={project.project_name} />
        <div style={{ maxWidth: 500, margin: "60px auto", padding: 32, background: "white", borderRadius: 12, textAlign: "center", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 700, color: "#0d1b2a", marginBottom: 8 }}>Awaiting CFO approval</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>CFO must approve the gross margin before finance analysis can proceed.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <StageNav projectId={params.id} currentStage={4} completedStage={project.stage} projectName={project.project_name} />
      <FinanceView projectId={params.id} project={project} />
    </div>
  );
}
