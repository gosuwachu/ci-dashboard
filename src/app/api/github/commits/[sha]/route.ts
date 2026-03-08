import { NextResponse } from "next/server";
import { fetchCommit } from "@/lib/github";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sha: string }> }
) {
  const { sha } = await params;

  try {
    const raw = await fetchCommit(sha);
    const commit = raw.commit as Record<string, unknown>;
    const commitAuthor = commit.author as Record<string, string>;
    const author = raw.author as Record<string, unknown> | null;

    return NextResponse.json({
      sha: raw.sha as string,
      message: (commit.message as string).split("\n")[0],
      author: commitAuthor.name,
      author_login: author ? (author.login as string) : null,
      avatar_url: author ? (author.avatar_url as string) : "",
      date: commitAuthor.date,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
