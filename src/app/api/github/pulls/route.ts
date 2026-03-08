import { NextResponse } from "next/server";
import { fetchPulls, fetchCombinedStatus } from "@/lib/github";
import type { PullRequest, StatusState } from "@/lib/types";

export async function GET() {
  try {
    const raw = await fetchPulls();

    const pulls: PullRequest[] = await Promise.all(
      raw.map(async (pr: Record<string, unknown>) => {
        const user = pr.user as Record<string, unknown>;
        const head = pr.head as Record<string, string>;

        let status: StatusState | null = null;
        try {
          const combined = await fetchCombinedStatus(head.sha);
          status = combined.total_count === 0 ? null : (combined.state as StatusState);
        } catch {
          // status unavailable
        }

        return {
          number: pr.number,
          title: pr.title,
          author: user.login,
          avatar_url: user.avatar_url,
          branch: head.ref,
          head_sha: head.sha,
          status,
          updated_at: pr.updated_at,
        };
      })
    );

    return NextResponse.json({ pulls });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
