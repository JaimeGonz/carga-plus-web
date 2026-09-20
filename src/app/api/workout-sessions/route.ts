import { backendFetch } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const backendRes = await backendFetch("/workout-sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  if (!backendRes.ok) {
    const error = await backendRes.json();
    return NextResponse.json(error, { status: backendRes.status });
  }

  return NextResponse.json(await backendRes.json());
}
