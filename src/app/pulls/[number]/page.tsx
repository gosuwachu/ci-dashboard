"use client";

import { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { POLLING_INTERVAL } from "@/lib/constants";
import type { GroupedStatuses } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import PlatformSection from "@/components/PlatformSection";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface PRDetail {
  pr: {
    number: number;
    title: string;
    author: string;
    branch: string;
    base_branch: string;
    head_sha: string;
    updated_at: string;
  };
  statuses: GroupedStatuses;
}

export default function PullRequestDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = use(params);
  const { data, error, isLoading } = useSWR<PRDetail>(
    `/api/github/pulls/${number}`,
    fetcher,
    { refreshInterval: POLLING_INTERVAL }
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (error || !data || !data.pr) {
    return <p className="text-red-500">Failed to load pull request</p>;
  }

  const { pr, statuses } = data;

  const overallState =
    [...statuses.ios, ...statuses.android].length === 0
      ? null
      : [...statuses.ios, ...statuses.android].some((s) => s.state === "failure" || s.state === "error")
        ? "failure" as const
        : [...statuses.ios, ...statuses.android].some((s) => s.state === "pending")
          ? "pending" as const
          : "success" as const;

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
          <span className="text-lg font-semibold text-gray-500">
            #{pr.number}
          </span>
          <h2 className="text-lg font-semibold text-gray-900">{pr.title}</h2>
          <StatusBadge state={overallState} />
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <span>{pr.author}</span>
          <span>&middot;</span>
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
            {pr.branch}
          </code>
          <span>&rarr;</span>
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
            {pr.base_branch}
          </code>
          <span>&middot;</span>
          <span>
            Head:{" "}
            <code className="font-mono text-xs">{pr.head_sha.slice(0, 7)}</code>
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white px-5 py-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          Commit Checks
        </h3>
        {statuses.ios.length === 0 &&
        statuses.android.length === 0 &&
        statuses.other.length === 0 ? (
          <p className="text-sm text-gray-400">No commit statuses</p>
        ) : (
          <>
            <PlatformSection platform="ios" statuses={statuses.ios} />
            <PlatformSection platform="android" statuses={statuses.android} />
          </>
        )}
      </div>
    </div>
  );
}
