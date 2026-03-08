import PullRequestList from "@/components/PullRequestList";

export default function PullRequestsPage() {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Open Pull Requests</h2>
      <PullRequestList />
    </div>
  );
}
