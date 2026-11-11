import { NextRequest, NextResponse } from "next/server";
import { callPythonBackend, PythonBackendError } from "@/lib/zerotrust";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await callPythonBackend("/api/kendra/execute", body);
    return NextResponse.json(data);
  } catch (error: unknown) {
    // propagate upstream 4xx (validation 400, rate-limit 429); only unknown failures are 500
    const status = error instanceof PythonBackendError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to execute scenario" },
      { status }
    );
  }
}
