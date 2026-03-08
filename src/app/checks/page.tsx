"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { POLLING_INTERVAL, parseContext, stepDisplayName } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import type { Commit, GroupedStatuses } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import CommitLink from "@/components/CommitLink";
import AuthorLink from "@/components/AuthorLink";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type RerunStatus = "idle" | "loading" | "success" | "error";

function CheckDetail() {
  const searchParams = useSearchParams();
  const sha = searchParams.get("sha");
  const job = searchParams.get("job");
  const build = searchParams.get("build");
  const name = searchParams.get("name") || "Check";
  const pr = searchParams.get("pr");

  const parsed = parseContext(name);
  const displayName = parsed
    ? `${parsed.platform.toUpperCase()} — ${stepDisplayName(parsed.step)}`
    : name;

  const [rerunStatus, setRerunStatus] = useState<RerunStatus>("idle");

  // Fetch commit details
  const { data: commit } = useSWR<Commit>(
    sha ? `/api/github/commits/${sha}` : null,
    fetcher,
  );

  // Fetch statuses to get state and created_at for this check
  const { data: statuses } = useSWR<GroupedStatuses>(
    sha ? `/api/github/commits/${sha}/statuses` : null,
    fetcher,
    { refreshInterval: POLLING_INTERVAL },
  );

  // Find this check's status from the grouped statuses
  const allStatuses = statuses
    ? [...statuses.ios, ...statuses.android, ...statuses.other]
    : [];
  const checkStatus = allStatuses.find((s) => s.context === name);

  // Fetch console output
  const { data: consoleData, error: consoleError, isLoading: consoleLoading } = useSWR<{ output: string }>(
    job && build ? `/api/jenkins/console?job=${encodeURIComponent(job)}&build=${encodeURIComponent(build)}` : null,
    fetcher,
    { refreshInterval: POLLING_INTERVAL },
  );

  // Fetch PR title if pr param is set
  const { data: prData } = useSWR<{ pr: { title: string } }>(
    pr ? `/api/github/pulls/${pr}` : null,
    fetcher,
  );

  const backLabel = pr
    ? `PR #${pr}${prData?.pr?.title ? `: ${prData.pr.title}` : ""}`
    : "Main Branch";
  const backHref = pr ? `/pulls/${pr}` : "/main";

  const jenkinsConsoleUrl = job && build
    ? `/api/jenkins/console?job=${encodeURIComponent(job)}&build=${encodeURIComponent(build)}`
    : null;
  // We don't have the raw Jenkins URL here, but we can construct a link via the API
  // The "View in Jenkins" link needs the actual Jenkins URL — we'll get it from the console response
  const jenkinsViewUrl = consoleData && "buildUrl" in consoleData
    ? (consoleData as { buildUrl?: string }).buildUrl?.replace(/\/?$/, "/console")
    : null;

  async function handleRerun() {
    if (!job || !build) return;
    setRerunStatus("loading");
    try {
      const res = await fetch("/api/jenkins/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, build }),
      });
      if (!res.ok) throw new Error();
      setRerunStatus("success");
      setTimeout(() => setRerunStatus("idle"), 2000);
    } catch {
      setRerunStatus("error");
      setTimeout(() => setRerunStatus("idle"), 3000);
    }
  }

  return (
    <div>
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; {backLabel}
      </Link>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
            {checkStatus && <StatusBadge state={checkStatus.state} />}
            {checkStatus && (
              <span className="text-xs text-gray-400">{timeAgo(checkStatus.created_at)}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {jenkinsViewUrl && (
              <a
                href={jenkinsViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View in Jenkins
              </a>
            )}
            {job && build && (
              <button
                onClick={handleRerun}
                disabled={rerunStatus === "loading"}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  rerunStatus === "success"
                    ? "bg-green-100 text-green-800"
                    : rerunStatus === "error"
                      ? "bg-red-100 text-red-800"
                      : rerunStatus === "loading"
                        ? "bg-gray-100 text-gray-500 cursor-wait"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {rerunStatus === "loading"
                  ? "Re-running..."
                  : rerunStatus === "success"
                    ? "Triggered"
                    : rerunStatus === "error"
                      ? "Failed"
                      : "Re-run"}
              </button>
            )}
          </div>
        </div>

        {commit && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <CommitLink sha={commit.sha} />
            <span>&middot;</span>
            <span className="truncate text-gray-700">{commit.message}</span>
            <span>&middot;</span>
            <AuthorLink login={commit.author_login} name={commit.author} />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-900 p-4 overflow-x-auto">
        {consoleLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-gray-700" style={{ width: `${40 + i * 10}%` }} />
            ))}
          </div>
        )}
        {consoleError && (
          <p className="text-sm text-red-400">Failed to load console output</p>
        )}
        {consoleData && (
          <pre className="text-xs leading-relaxed text-gray-200 whitespace-pre-wrap break-words font-mono">
            {consoleData.output || "No output"}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function CheckPage() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-gray-100" />}>
      <CheckDetail />
    </Suspense>
  );
}
