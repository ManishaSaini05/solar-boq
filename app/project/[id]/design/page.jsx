import { supabase } from "@/lib/supabase";
import BoQCalculator from "@/components/BoQCalculator";
import StageNav from "@/components/StageNav";

export const revalidate = 0;

export default async function DesignPage({ params }) {
  const { data: project } = await supabase
    .from("projects").select("*").eq("id", params.id).single();

  if (!project) return <div style={{ padding: 40 }}>Project not found.</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <StageNav
        projectId={params.id}
        currentStage={2}
        completedStage={project.stage}
        projectName={project.project_name}
      />
      <BoQCalculator
        projectId={params.id}
        project={project}
        initialInputs={project.design_inputs}
        initialBoqManual={project.boq_manual}
      />
    </div>
  );
}
