import { supabase } from "@/lib/supabase";
import StageNav from "@/components/StageNav";
import ProposalActions from "@/components/ProposalActions";

export const revalidate = 0;

export default async function ProposalPage({ params }) {
  const { data: project } = await supabase
    .from("projects").select("*").eq("id", params.id).single();

  if (!project) return <div style={{ padding: 40 }}>Project not found.</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <StageNav projectId={params.id} currentStage={5} completedStage={project.stage} projectName={project.project_name} />
      <ProposalActions projectId={params.id} project={project} />
    </div>
  );
}
