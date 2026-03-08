import { NextResponse } from "next/server";
import { fetchCommits, fetchCombinedStatus } from "@/lib/github";
import type { Commit, StatusState } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sha = searchParams.get("sha") || "main";
  const perPage = Number(searchParams.get("per_page") || "20");

  try {
    const raw = await fetchCommits(sha, perPage);

    const commits: Commit[] = await Promise.all(
      raw.map(async (c: Record<string, unknown>) => {
        const commit = c.commit as Record<string, unknown>;
        const author = c.author as Record<string, unknown> | null;
        const commitAuthor = commit.author as Record<string, string>;

        let status: StatusState | null = null;
        try {
          const combined = await fetchCombinedStatus(c.sha as string);
          status = combined.state === "success"
            ? "success"
            : combined.state === "failure"
              ? "failure"
              : combined.state === "pending"
                ? "pending"
                : combined.total_count === 0
                  ? null
                  : (combined.state as StatusState);
        } catch {
          // status unavailable
        }

        return {
          sha: c.sha,
          message: (commit.message as string).split("\n")[0],
          author: commitAuthor.name,
          author_login: author ? (author.login as string) : null,
          avatar_url: author ? (author.avatar_url as string) : "",
          date: commitAuthor.date,
          status,
        };
      })
    );

    return NextResponse.json({ commits });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
