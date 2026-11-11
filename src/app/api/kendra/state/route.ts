import { NextResponse } from "next/server";
import { callPythonBackend, PythonBackendError } from "@/lib/zerotrust";

export async function GET() {
  try {
    const data = await callPythonBackend("/api/kendra/state", {}, { method: "GET" });
    return NextResponse.json(data);
  } catch (error: unknown) {
    // propagate upstream 4xx; only unknown failures are 500
    const status = error instanceof PythonBackendError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Failed to fetch state";
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
