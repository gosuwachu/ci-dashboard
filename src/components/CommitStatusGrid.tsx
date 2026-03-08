"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { POLLING_INTERVAL, stepDisplayName } from "@/lib/constants";
import type { GroupedStatuses, ParsedStatus, CommitStatus, StatusState } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function cellColors(state: StatusState | null): string {
  switch (state) {
    case "success":
      return "bg-green-500 text-white";
    case "failure":
    case "error":
      return "bg-red-500 text-white";
    case "pending":
      return "animate-pulse bg-yellow-400 text-gray-900";
    default:
      return "bg-gray-200 text-gray-500";
  }
}

function checkPageUrl(targetUrl: string | null, name: string, from: string, state: StatusState): string | undefined {
  if (!targetUrl) return undefined;
  return `/checks?build=${encodeURIComponent(targetUrl)}&name=${encodeURIComponent(name)}&from=${encodeURIComponent(from)}&state=${state}`;
}

type RerunStatus = "idle" | "loading" | "success" | "error";

function RerunButton({ buildUrl }: { buildUrl: string }) {
  const [status, setStatus] = useState<RerunStatus>("idle");

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setStatus("loading");
    try {
      const res = await fetch("/api/jenkins/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildUrl }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      title="Re-run this check"
      className={`absolute top-1 right-1 rounded px-1 py-0.5 text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity ${
        status === "success"
          ? "bg-white/40 text-white"
          : status === "error"
            ? "bg-white/80 text-red-700"
            : status === "loading"
              ? "bg-white/40 text-white cursor-wait"
              : "bg-white/30 text-white hover:bg-white/50"
      }`}
    >
      {status === "loading" ? "..." : status === "success" ? "OK" : status === "error" ? "Err" : "Re-run"}
    </button>
  );
}

function StatusCell({ status, from }: { status: ParsedStatus; from: string }) {
  const displayName = stepDisplayName(status.step);
  const url = checkPageUrl(status.target_url, `${status.platform.toUpperCase()} — ${displayName}`, from, status.state);
  const colors = cellColors(status.state);
  const content = (
    <>
      <span className="text-xs font-semibold">{displayName}</span>
      <span className="text-[10px] opacity-80">{status.description}</span>
    </>
  );

  const rerun = status.target_url ? <RerunButton buildUrl={status.target_url} /> : null;

  if (url) {
    return (
      <Link
        href={url}
        className={`group relative flex flex-col items-center justify-center rounded-lg px-3 py-3 min-w-[110px] transition-opacity hover:opacity-80 ${colors}`}
      >
        {content}
        {rerun}
      </Link>
    );
  }

  return (
    <div className={`group relative flex flex-col items-center justify-center rounded-lg px-3 py-3 min-w-[110px] ${colors}`}>
      {content}
      {rerun}
    </div>
  );
}

function OtherCell({ status, from }: { status: CommitStatus; from: string }) {
  const url = checkPageUrl(status.target_url, status.context, from, status.state);
  const colors = cellColors(status.state);
  const content = (
    <>
      <span className="text-xs font-semibold">{status.context}</span>
      <span className="text-[10px] opacity-80">{status.description}</span>
    </>
  );

  const rerun = status.target_url ? <RerunButton buildUrl={status.target_url} /> : null;

  if (url) {
    return (
      <Link
        href={url}
        className={`group relative flex flex-col items-center justify-center rounded-lg px-3 py-3 min-w-[110px] transition-opacity hover:opacity-80 ${colors}`}
      >
        {content}
        {rerun}
      </Link>
    );
  }

  return (
    <div className={`group relative flex flex-col items-center justify-center rounded-lg px-3 py-3 min-w-[110px] ${colors}`}>
      {content}
      {rerun}
    </div>
  );
}

function PlatformSection({ label, statuses, from }: { label: string; statuses: ParsedStatus[]; from: string }) {
  if (statuses.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </h4>
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <StatusCell key={s.context} status={s} from={from} />
        ))}
      </div>
    </div>
  );
}

export default function CommitStatusGrid({ sha }: { sha: string }) {
  const pathname = usePathname();
  const { data, error, isLoading } = useSWR<GroupedStatuses>(
    `/api/github/commits/${sha}/statuses`,
    fetcher,
    { refreshInterval: POLLING_INTERVAL }
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 py-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-2">
            <div className="h-14 w-16 rounded bg-gray-100" />
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-14 w-28 rounded bg-gray-100" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (error || !data || !data.ios) {
    return <p className="text-sm text-red-500 py-2">Failed to load statuses</p>;
  }

  if (data.ios.length === 0 && data.android.length === 0 && data.other.length === 0) {
    return <p className="text-sm text-gray-400 py-2">No commit statuses</p>;
  }

  return (
    <div className="space-y-4">
      <PlatformSection label="iOS" statuses={data.ios} from={pathname} />
      <PlatformSection label="Android" statuses={data.android} from={pathname} />
      {data.other.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Other
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.other.map((s) => (
              <OtherCell key={s.context} status={s} from={pathname} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
