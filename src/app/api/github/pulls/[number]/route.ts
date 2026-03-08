import { NextResponse } from "next/server";
import { fetchPull, fetchPullCommits, fetchCombinedStatus, fetchPullReviews } from "@/lib/github";
import { OWNER, REPO } from "@/lib/constants";
import type { StatusState } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;

  try {
    const [pr, rawCommits, rawReviews] = await Promise.all([
      fetchPull(Number(number)),
      fetchPullCommits(Number(number)),
      fetchPullReviews(Number(number)),
    ]);

    const head = pr.head as Record<string, string>;
    const user = pr.user as Record<string, unknown>;

    // Determine review state: take the latest decisive review per reviewer
    const reviewsByUser = new Map<string, string>();
    for (const r of rawReviews as Record<string, unknown>[]) {
      const reviewer = (r.user as Record<string, unknown>).login as string;
      const state = r.state as string;
      if (state === "APPROVED" || state === "CHANGES_REQUESTED" || state === "DISMISSED") {
        reviewsByUser.set(reviewer, state);
      }
    }
    const reviewStates = [...reviewsByUser.values()];
    const review_state = reviewStates.includes("CHANGES_REQUESTED")
      ? "changes_requested"
      : reviewStates.includes("APPROVED")
        ? "approved"
        : "pending";

    // Build commit list (newest first) with combined status
    const commits = await Promise.all(
      (rawCommits as Record<string, unknown>[]).reverse().map(async (c) => {
        const commit = c.commit as Record<string, unknown>;
        const commitAuthor = commit.author as Record<string, string>;
        const author = c.author as Record<string, unknown> | null;

        let status: StatusState | null = null;
        try {
          const combined = await fetchCombinedStatus(c.sha as string);
          status = combined.total_count === 0 ? null : (combined.state as StatusState);
        } catch {
          // status unavailable
        }

        return {
          sha: c.sha as string,
          message: (commit.message as string).split("\n")[0],
          author: commitAuthor.name,
          author_login: author ? (author.login as string) : null,
          avatar_url: author ? (author.avatar_url as string) : "",
          date: commitAuthor.date,
          status,
        };
      })
    );

    return NextResponse.json({
      pr: {
        number: pr.number,
        title: pr.title,
        author: user.login,
        avatar_url: user.avatar_url,
        branch: head.ref,
        base_branch: (pr.base as Record<string, string>).ref,
        head_sha: head.sha,
        html_url: `https://github.com/${OWNER}/${REPO}/pull/${pr.number}`,
        review_state,
        updated_at: pr.updated_at,
      },
      commits,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
