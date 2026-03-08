"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { POLLING_INTERVAL } from "@/lib/constants";
import type { StatusState } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type RerunStatus = "idle" | "loading" | "success" | "error";

function CheckDetail() {
  const searchParams = useSearchParams();
  const buildUrl = searchParams.get("build");
  const name = searchParams.get("name") || "Check";
  const from = searchParams.get("from") || "/main";
  const state = (searchParams.get("state") || null) as StatusState | null;

  const backLabel = from.startsWith("/pulls/")
    ? `PR #${from.split("/").pop()}`
    : "Main Branch";

  const [rerunStatus, setRerunStatus] = useState<RerunStatus>("idle");

  const { data, error, isLoading } = useSWR<{ output: string }>(
    buildUrl ? `/api/jenkins/console?buildUrl=${encodeURIComponent(buildUrl)}` : null,
    fetcher,
    { refreshInterval: POLLING_INTERVAL }
  );

  async function handleRerun() {
    if (!buildUrl) return;
    setRerunStatus("loading");
    try {
      const res = await fetch("/api/jenkins/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildUrl }),
      });
      if (!res.ok) throw new Error();
      setRerunStatus("success");
      setTimeout(() => setRerunStatus("idle"), 2000);
    } catch {
      setRerunStatus("error");
      setTimeout(() => setRerunStatus("idle"), 3000);
    }
  }

  const consoleUrl = buildUrl ? buildUrl.replace(/\/?$/, "/console") : null;

  return (
    <div>
      <Link
        href={from}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; {backLabel}
      </Link>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
            <StatusBadge state={state} />
          </div>
          <div className="flex items-center gap-2">
            {consoleUrl && (
              <a
                href={consoleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View in Jenkins
              </a>
            )}
            {buildUrl && (
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
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-900 p-4 overflow-x-auto">
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-gray-700" style={{ width: `${40 + i * 10}%` }} />
            ))}
          </div>
        )}
        {error && (
          <p className="text-sm text-red-400">Failed to load console output</p>
        )}
        {data && (
          <pre className="text-xs leading-relaxed text-gray-200 whitespace-pre-wrap break-words font-mono">
            {data.output || "No output"}
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
