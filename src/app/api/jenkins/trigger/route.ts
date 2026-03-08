import { NextResponse } from "next/server";
import { triggerBuild } from "@/lib/jenkins";

export async function POST(request: Request) {
  try {
    const { jobPath } = await request.json();
    if (!jobPath || typeof jobPath !== "string") {
      return NextResponse.json({ error: "jobPath is required" }, { status: 400 });
    }

    await triggerBuild(jobPath);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
