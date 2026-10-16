import { NextRequest, NextResponse } from "next/server";
import { callPythonBackend } from "@/lib/zerotrust";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await callPythonBackend("/api/kendra/repay", body);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to execute repayment sweep" },
      { status: 500 }
    );
  }
}
