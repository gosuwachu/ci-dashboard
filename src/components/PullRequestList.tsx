"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { OWNER, REPO, POLLING_INTERVAL } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import type { PullRequest } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import AuthorLink from "./AuthorLink";
import CommitLink from "./CommitLink";
import LabelBadge from "./LabelBadge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PullRequestList() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<{ pulls: PullRequest[] }>(
    "/api/github/pulls",
    fetcher,
    { refreshInterval: POLLING_INTERVAL }
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-red-500">Failed to load pull requests</p>;
  }

  if (data.pulls.length === 0) {
    return <p className="text-gray-500 text-center py-8">No open pull requests</p>;
  }

  return (
    <div className="space-y-2">
      {data.pulls.map((pr) => (
        <div
          key={pr.number}
          onClick={() => router.push(`/pulls/${pr.number}`)}
          className="block cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href={`https://github.com/${OWNER}/${REPO}/pull/${pr.number}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                #{pr.number}
              </a>
              <span className="text-sm font-medium text-gray-800">
                {pr.title}
              </span>
              {pr.labels.map((l) => (
                <LabelBadge key={l.name} label={l} />
              ))}
            </div>
            <StatusBadge state={pr.status} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400" onClick={(e) => e.stopPropagation()}>
            <AuthorLink login={pr.author} name={pr.author} />
            <span>&middot;</span>
            <CommitLink sha={pr.head_sha} />
            <span>&middot;</span>
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
              {pr.branch}
            </code>
            <span>&middot;</span>
            <span>{timeAgo(pr.updated_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
