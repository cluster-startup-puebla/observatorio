import { NextResponse } from "next/server";
import { resetMemoryRuns } from "@/lib/methodology/v2/memory-runs";
import { resetDirectory } from "@/lib/memory-directory";

export async function POST() {
  if (process.env.DIRECTORY !== "memory") {
    return NextResponse.json({ error: "solo en memoria" }, { status: 404 });
  }
  resetDirectory();
  resetMemoryRuns();
  return NextResponse.json({ ok: true });
}
