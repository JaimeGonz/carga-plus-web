import { backendFetch } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendRes = await backendFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!backendRes.ok) {
    const error = await backendRes.json();
    return NextResponse.json(error, { status: backendRes.status });
  }

  const user = await backendRes.json();
  return NextResponse.json(user);
}
