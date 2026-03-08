import { NextResponse } from "next/server";
import { fetchStatuses } from "@/lib/github";
import { parseContext } from "@/lib/constants";
import type { CommitStatus, ParsedStatus, GroupedStatuses } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sha: string }> }
) {
  const { sha } = await params;

  try {
    const raw: CommitStatus[] = await fetchStatuses(sha);

    // Deduplicate: keep most recent status per context
    const byContext = new Map<string, CommitStatus>();
    for (const s of raw) {
      if (!byContext.has(s.context)) {
        byContext.set(s.context, s);
      }
    }

    const grouped: GroupedStatuses = { ios: [], android: [], other: [] };

    for (const s of byContext.values()) {
      const parsed = parseContext(s.context);
      if (parsed) {
        const ps: ParsedStatus = { ...s, platform: parsed.platform, step: parsed.step };
        if (parsed.platform === "ios") grouped.ios.push(ps);
        else grouped.android.push(ps);
      } else {
        grouped.other.push(s);
      }
    }

    return NextResponse.json(grouped);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
