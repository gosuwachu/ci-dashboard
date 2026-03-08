import { NextResponse } from "next/server";
import { fetchJobInfo } from "@/lib/jenkins";

interface PipelineInfo {
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

const PIPELINES = [
  "mobile-app/ios-alpha",
  "mobile-app/android-alpha",
  "mobile-app/ios-production",
  "mobile-app/android-production",
];

export async function GET() {
  try {
    const results = await Promise.all(
      PIPELINES.map(async (path) => {
        try {
          const data = await fetchJobInfo(
            path,
            "name,displayName,color,lastBuild[number,result,timestamp,url]"
          );
          return {
            path,
            name: data.name,
            displayName: data.displayName,
            color: data.color,
            lastBuild: data.lastBuild,
          } as PipelineInfo & { path: string };
        } catch {
          return { path, name: path.split("/").pop()!, displayName: path, color: "notbuilt", lastBuild: null };
        }
      })
    );
    return NextResponse.json({ pipelines: results });
  } catch {
    return NextResponse.json({ error: "Failed to fetch pipelines" }, { status: 500 });
  }
}
