import { backendFetch } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const excerciseId = request.nextUrl.searchParams.get("exerciseId");

  const backendRes = await backendFetch(
    `/workout-sessions/sets/previous?exerciseId=${excerciseId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!backendRes.ok) {
    const error = await backendRes.json();
    return NextResponse.json(error, { status: backendRes.status });
  }

  return NextResponse.json(await backendRes.json());
}
