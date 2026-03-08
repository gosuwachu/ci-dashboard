import { NextResponse } from "next/server";
import { fetchPull, fetchStatuses } from "@/lib/github";
import { parseContext } from "@/lib/constants";
import type { CommitStatus, ParsedStatus, GroupedStatuses } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;

  try {
    const pr = await fetchPull(Number(number));
    const head = pr.head as Record<string, string>;
    const user = pr.user as Record<string, unknown>;

    const raw: CommitStatus[] = await fetchStatuses(head.sha);

    const byContext = new Map<string, CommitStatus>();
    for (const s of raw) {
      if (!byContext.has(s.context)) {
        byContext.set(s.context, s);
      }
    }

    const statuses: GroupedStatuses = { ios: [], android: [], other: [] };
    for (const s of byContext.values()) {
      const parsed = parseContext(s.context);
      if (parsed) {
        const ps: ParsedStatus = { ...s, platform: parsed.platform, step: parsed.step };
        if (parsed.platform === "ios") statuses.ios.push(ps);
        else statuses.android.push(ps);
      } else {
        statuses.other.push(s);
      }
    }

    return NextResponse.json({
      pr: {
        number: pr.number,
        title: pr.title,
        author: user.login,
        avatar_url: user.avatar_url,
        branch: head.ref,
        base_branch: (pr.base as Record<string, string>).ref,
        head_sha: head.sha,
        body: pr.body,
        updated_at: pr.updated_at,
      },
      statuses,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
