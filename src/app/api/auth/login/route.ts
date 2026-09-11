import { backendFetch } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendRes = await backendFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!backendRes.ok) {
    const error = await backendRes.json();
    return NextResponse.json(error, { status: backendRes.status });
  }

  const { access_token } = await backendRes.json();
  const response = NextResponse.json({ success: true });

  response.cookies.set("access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return response;
}
