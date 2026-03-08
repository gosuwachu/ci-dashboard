"use client";

import Link from "next/link";
import useSWR from "swr";
import { POLLING_INTERVAL } from "@/lib/constants";
import type { PullRequest } from "@/lib/types";
import StatusBadge from "./StatusBadge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function PullRequestList() {
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
        <Link
          key={pr.number}
          href={`/pulls/${pr.number}`}
          className="block rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-500">
                #{pr.number}
              </span>
              <span className="text-sm font-medium text-gray-800">
                {pr.title}
              </span>
            </div>
            <StatusBadge state={pr.status} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
            <span>{pr.author}</span>
            <span>&middot;</span>
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
              {pr.branch}
            </code>
            <span>&middot;</span>
            <span>{timeAgo(pr.updated_at)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
