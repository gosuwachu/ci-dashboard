"use client";

import useSWR from "swr";
import { POLLING_INTERVAL } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Pipeline {
  path: string;
  name: string;
  displayName: string;
  color: string;
  lastBuild: {
    number: number;
    result: string | null;
    timestamp: number;
    url: string;
  } | null;
}

function statusFromColor(color: string): { bg: string; dot: string; label: string } {
  if (color.endsWith("_anime")) {
    return { bg: "bg-yellow-100", dot: "bg-yellow-500 animate-pulse", label: "Running" };
  }
  switch (color) {
    case "blue":
      return { bg: "bg-green-100", dot: "bg-green-500", label: "Success" };
    case "red":
      return { bg: "bg-red-100", dot: "bg-red-500", label: "Failed" };
    case "yellow":
      return { bg: "bg-yellow-100", dot: "bg-yellow-500", label: "Unstable" };
    case "aborted":
      return { bg: "bg-gray-100", dot: "bg-gray-400", label: "Aborted" };
    default:
      return { bg: "bg-gray-100", dot: "bg-gray-300", label: "Not built" };
  }
}

function PipelineRow({ pipeline }: { pipeline: Pipeline }) {
  const { bg, dot, label } = statusFromColor(pipeline.color);
  const jenkinsUrl = `http://localhost:8080/job/${pipeline.path.replace(/\//g, "/job/")}/`;

  return (
    <a
      href={jenkinsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${bg}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {label}
        </span>
        <span className="text-sm font-medium text-gray-800">{pipeline.displayName}</span>
      </div>
      {pipeline.lastBuild ? (
        <span className="text-xs text-gray-400">
          #{pipeline.lastBuild.number} &middot; {timeAgo(new Date(pipeline.lastBuild.timestamp).toISOString())}
        </span>
      ) : (
        <span className="text-xs text-gray-400">No builds</span>
      )}
    </a>
  );
}

export default function PipelineLinks() {
  const { data, isLoading } = useSWR<{ pipelines: Pipeline[] }>(
    "/api/jenkins/pipelines",
    fetcher,
    { refreshInterval: POLLING_INTERVAL }
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!data?.pipelines) return null;

  const alpha = data.pipelines.filter((p) => p.name.includes("alpha"));
  const production = data.pipelines.filter((p) => p.name.includes("production"));

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Alpha</h4>
        <div className="space-y-2">
          {alpha.map((p) => (
            <PipelineRow key={p.path} pipeline={p} />
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Production</h4>
        <div className="space-y-2">
          {production.map((p) => (
            <PipelineRow key={p.path} pipeline={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
