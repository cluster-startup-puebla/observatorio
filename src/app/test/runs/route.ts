import { NextResponse } from "next/server";
import { memoryRuns } from "@/lib/methodology/v2/memory-runs";

export async function GET() {
  if (process.env.DIRECTORY !== "memory") {
    return NextResponse.json({ error: "solo en memoria" }, { status: 404 });
  }
  return NextResponse.json({ rows: [...memoryRuns().values()] });
}
