"use client";

import { useState } from "react";
import useSWR from "swr";
import { POLLING_INTERVAL } from "@/lib/constants";
import type { Commit } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import CommitStatusGrid from "./CommitStatusGrid";

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
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-red-500">Failed to load commits</p>;
  }

  return (
    <div className="space-y-2">
      {data.commits.map((c) => (
        <div key={c.sha} className="rounded-lg border border-gray-200 bg-white">
          <button
            onClick={() => setExpanded(expanded === c.sha ? null : c.sha)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span
              className={`text-xs transition-transform ${expanded === c.sha ? "rotate-90" : ""}`}
            >
              &#9654;
            </span>
            <code className="text-xs font-mono text-gray-500">
              {c.sha.slice(0, 7)}
            </code>
            <span className="flex-1 truncate text-sm font-medium text-gray-800">
              {c.message}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {c.author} &middot; {timeAgo(c.date)}
            </span>
            <StatusBadge state={c.status} />
          </button>
          {expanded === c.sha && (
            <div className="border-t border-gray-100 px-4 py-2">
              <CommitStatusGrid sha={c.sha} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
