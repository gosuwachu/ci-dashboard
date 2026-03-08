import { NextResponse } from "next/server";
import { triggerBuild, fetchBuildParams } from "@/lib/jenkins";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Replay mode: fetch params from a previous build and re-trigger omnibus
    if (body.buildUrl) {
      const params = await fetchBuildParams(body.buildUrl);
      await triggerBuild("mobile-app-support/omnibus", params);
      return NextResponse.json({ ok: true });
    }

    // Direct trigger mode: trigger a specific job path
    if (!body.jobPath || typeof body.jobPath !== "string") {
      return NextResponse.json({ error: "jobPath or buildUrl is required" }, { status: 400 });
    }

    await triggerBuild(body.jobPath, body.params);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
