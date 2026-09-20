import { backendFetch } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const backendRes = await backendFetch(`/workout-sessions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!backendRes.ok) {
    const error = await backendRes.json();
    return NextResponse.json(error, { status: backendRes.status });
  }

  return NextResponse.json(await backendRes.json());
}
