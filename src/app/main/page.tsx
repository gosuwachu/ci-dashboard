import CommitList from "@/components/CommitList";
import PipelineLinks from "@/components/PipelineLinks";

export default function MainBranchPage() {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Main Branch</h2>
      <div className="mb-6">
        <PipelineLinks />
      </div>
      <CommitList />
    </div>
  );
}
