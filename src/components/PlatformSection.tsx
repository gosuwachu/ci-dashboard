"use client";

import type { ParsedStatus } from "@/lib/types";
import { stepDisplayName } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

export default function PlatformSection({
  platform,
  statuses,
}: {
  platform: string;
  statuses: ParsedStatus[];
}) {
  if (statuses.length === 0) return null;

  return (
    <div className="mt-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        {platform === "ios" ? "iOS" : "Android"}
      </h4>
      <div className="space-y-1">
        {statuses.map((s) => (
          <div
            key={s.context}
            className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-3">
              <StatusBadge state={s.state} />
              <span className="font-medium text-gray-700">
                {stepDisplayName(s.step)}
              </span>
              {s.description && (
                <span className="text-gray-400 text-xs">{s.description}</span>
              )}
              <span className="text-gray-400 text-xs">{timeAgo(s.created_at)}</span>
            </div>
            {s.target_url && (
              <a
                href={s.target_url.replace(/\/?$/, "/console")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                View in Jenkins
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
