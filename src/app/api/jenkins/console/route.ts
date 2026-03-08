import { NextResponse } from "next/server";
import { fetchConsoleOutput } from "@/lib/jenkins";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const buildUrl = searchParams.get("buildUrl");

  if (!buildUrl) {
    return NextResponse.json({ error: "buildUrl is required" }, { status: 400 });
  }

  try {
    const output = await fetchConsoleOutput(buildUrl);
    return NextResponse.json({ output, buildUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
