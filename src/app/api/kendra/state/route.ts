import { NextResponse } from "next/server";
import { callPythonBackend } from "@/lib/zerotrust";

export async function GET() {
  try {
    const data = await callPythonBackend("/api/kendra/state", {}, { method: "GET" });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch state";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
