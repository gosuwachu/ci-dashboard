"use client";

import { useState } from "react";
import useSWR from "swr";
import { POLLING_INTERVAL } from "@/lib/constants";
import type { Commit } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import CommitStatusGrid from "./CommitStatusGrid";
import AuthorLink from "./AuthorLink";
import CommitLink from "./CommitLink";
import { timeAgo } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function LatestCommit({ commit }: { commit: Commit }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-gray-900">{commit.message}</h3>
      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
        <CommitLink sha={commit.sha} />
        <span>&middot;</span>
        <AuthorLink login={commit.author_login} name={commit.author} />
        <span>&middot;</span>
        <span>{timeAgo(commit.date)}</span>
      </div>
      <div className="mt-4">
        <CommitStatusGrid sha={commit.sha} />
      </div>
    </div>
  );
}

function PreviousCommitRow({
  commit,
  expanded,
  onToggle,
}: {
  commit: Commit;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className={`text-xs transition-transform ${expanded ? "rotate-90" : ""}`}>
          &#9654;
        </span>
        <CommitLink sha={commit.sha} />
        <span className="flex-1 truncate text-sm font-medium text-gray-800">
          {commit.message}
        </span>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          <AuthorLink login={commit.author_login} name={commit.author} />
          {" "}&middot; {timeAgo(commit.date)}
        </span>
        <StatusBadge state={commit.status} />
      </button>
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3">
          <CommitStatusGrid sha={commit.sha} />
        </div>
      )}
    </div>
  );
}

export default function CommitList() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data, error, isLoading } = useSWR<{ commits: Commit[] }>(
    "/api/github/commits?sha=main",
    fetcher,
    { refreshInterval: POLLING_INTERVAL }
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-red-500">Failed to load commits</p>;
  }

  const [latest, ...previous] = data.commits;

  return (
    <div>
      {latest && <LatestCommit commit={latest} />}

      {previous.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Previous
          </h3>
          <div className="space-y-2">
            {previous.map((c) => (
              <PreviousCommitRow
                key={c.sha}
                commit={c}
                expanded={expanded === c.sha}
                onToggle={() => setExpanded(expanded === c.sha ? null : c.sha)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
