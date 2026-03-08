"use client";

import useSWR from "swr";
import { POLLING_INTERVAL, stepDisplayName } from "@/lib/constants";
import type { GroupedStatuses, ParsedStatus, StatusState } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function cellColors(state: StatusState | null): string {
  switch (state) {
    case "success":
      return "bg-green-500 text-white";
    case "failure":
    case "error":
      return "bg-red-500 text-white";
    case "pending":
      return "bg-yellow-400 text-gray-900";
    default:
      return "bg-gray-200 text-gray-500";
  }
}

function consoleUrl(targetUrl: string | null): string | undefined {
  if (!targetUrl) return undefined;
  return targetUrl.replace(/\/?$/, "/console");
}

function StatusCell({ status }: { status: ParsedStatus }) {
  const url = consoleUrl(status.target_url);
  const colors = cellColors(status.state);
  const content = (
    <>
      <span className="text-xs font-semibold">{stepDisplayName(status.step)}</span>
      <span className="text-[10px] opacity-80">{status.description}</span>
    </>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-col items-center justify-center rounded-lg px-3 py-3 min-w-[110px] transition-opacity hover:opacity-80 ${colors}`}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center rounded-lg px-3 py-3 min-w-[110px] ${colors}`}>
      {content}
    </div>
  );
}

function PlatformRow({ label, statuses }: { label: string; statuses: ParsedStatus[] }) {
  if (statuses.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <StatusCell key={s.context} status={s} />
        ))}
      </div>
    </div>
  );
}

export default function CommitStatusGrid({ sha }: { sha: string }) {
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

  if (error || !data) {
    return <p className="text-sm text-red-500 py-2">Failed to load statuses</p>;
  }

  if (data.ios.length === 0 && data.android.length === 0 && data.other.length === 0) {
    return <p className="text-sm text-gray-400 py-2">No commit statuses</p>;
  }

  return (
    <div className="space-y-3">
      <PlatformRow label="iOS" statuses={data.ios} />
      <PlatformRow label="Android" statuses={data.android} />
    </div>
  );
}
