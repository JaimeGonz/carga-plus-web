import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard"]


export function proxy(request: NextRequest ){
    const { pathname } = request.nextUrl;
    const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

    if(isProtected) {
        const token = request.cookies.get("access_token");
        if(!token){
            return NextResponse.redirect(new URL("/login", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*"]
}