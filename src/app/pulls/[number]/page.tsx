"use client";

import { use, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { POLLING_INTERVAL } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import type { Commit } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import CommitStatusGrid from "@/components/CommitStatusGrid";
import AuthorLink from "@/components/AuthorLink";
import CommitLink from "@/components/CommitLink";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const reviewStyles: Record<string, { bg: string; text: string; label: string }> = {
  approved: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
  changes_requested: { bg: "bg-red-100", text: "text-red-800", label: "Changes Requested" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Review Pending" },
};

function ReviewBadge({ state }: { state: string }) {
  const s = reviewStyles[state] || reviewStyles.pending;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

interface PRDetail {
  pr: {
    number: number;
    title: string;
    author: string;
    branch: string;
    base_branch: string;
    head_sha: string;
    html_url: string;
    review_state: string;
    updated_at: string;
  };
  commits: Commit[];
}

export default function PullRequestDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = use(params);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data, error, isLoading } = useSWR<PRDetail>(
    `/api/github/pulls/${number}`,
    fetcher,
    { refreshInterval: POLLING_INTERVAL }
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (error || !data || !data.pr) {
    return <p className="text-red-500">Failed to load pull request</p>;
  }

  const { pr, commits } = data;
  const [latest, ...previous] = commits;

  return (
    <div>
      <Link
        href="/pulls"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to Pull Requests
      </Link>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <a
            href={pr.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            #{pr.number}
          </a>
          <h2 className="text-lg font-semibold text-gray-900">{pr.title}</h2>
          <ReviewBadge state={pr.review_state} />
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <AuthorLink login={pr.author} name={pr.author} />
          <span>&middot;</span>
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
            {pr.branch}
          </code>
          <span>&rarr;</span>
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
            {pr.base_branch}
          </code>
        </div>
      </div>

      {latest && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">{latest.message}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <CommitLink sha={latest.sha} />
            <span>&middot;</span>
            <AuthorLink login={latest.author_login} name={latest.author} />
            <span>&middot;</span>
            <span>{timeAgo(latest.date)}</span>
          </div>
          <div className="mt-4">
            <CommitStatusGrid sha={latest.sha} />
          </div>
        </div>
      )}

      {previous.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Previous
          </h3>
          <div className="space-y-2">
            {previous.map((c) => (
              <div key={c.sha} className="rounded-lg border border-gray-200 bg-white">
                <button
                  onClick={() =>
                    setExpanded(expanded === c.sha ? null : c.sha)
                  }
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`text-xs transition-transform ${
                      expanded === c.sha ? "rotate-90" : ""
                    }`}
                  >
                    &#9654;
                  </span>
                  <CommitLink sha={c.sha} />
                  <span className="flex-1 truncate text-sm font-medium text-gray-800">
                    {c.message}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    <AuthorLink login={c.author_login} name={c.author} />
                    {" "}&middot; {timeAgo(c.date)}
                  </span>
                  <StatusBadge state={c.status} />
                </button>
                {expanded === c.sha && (
                  <div className="border-t border-gray-100 px-4 py-3">
                    <CommitStatusGrid sha={c.sha} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
