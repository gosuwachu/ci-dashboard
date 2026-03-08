"use client";

import useSWR from "swr";
import { POLLING_INTERVAL } from "@/lib/constants";
import type { GroupedStatuses } from "@/lib/types";
import PlatformSection from "./PlatformSection";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CommitStatusGrid({ sha }: { sha: string }) {
  const { data, error, isLoading } = useSWR<GroupedStatuses>(
    `/api/github/commits/${sha}/statuses`,
    fetcher,
    { refreshInterval: POLLING_INTERVAL }
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded bg-gray-100" />
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
    <div className="pb-2">
      <PlatformSection platform="ios" statuses={data.ios} />
      <PlatformSection platform="android" statuses={data.android} />
      {data.other.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Other
          </h4>
          {data.other.map((s) => (
            <div
              key={s.context}
              className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
            >
              <span className="text-gray-700">{s.context}</span>
              <span className="text-xs text-gray-400">{s.state}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
