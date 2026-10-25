import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "kendrafi-bff",
    version: "1.0.0",
  });
}
