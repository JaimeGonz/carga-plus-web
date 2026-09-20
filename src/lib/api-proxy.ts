import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "./backend";

export async function proxyToBackend(
  request: NextRequest,
  path: string,
  options: RequestInit = {},
) {
  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const backendRes = await backendFetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!backendRes.ok) {
    const error = backendRes.json();
    return NextResponse.json(error, { status: backendRes.status });
  }

  return NextResponse.json(await backendRes.json());
}
