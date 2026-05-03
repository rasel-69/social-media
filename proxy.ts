import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const sessionCookie = request.cookies.get("better-auth.session_token") || 
                         request.cookies.get("__Secure-better-auth.session_token");

    const { pathname } = request.nextUrl;

    // Define strictly private routes that ALWAYS require a login
    const isProtectedRoute = pathname.startsWith("/Notifications") ||
                             pathname.startsWith("/Messages") ||
                             pathname.startsWith("/Post/new") ||
                             pathname.startsWith("/notifications") ||
                             pathname.startsWith("/messages") ||
                             pathname.startsWith("/post") ||
                             pathname.startsWith("/profile") ||
                             pathname.startsWith("/Profile");
    
    // Auth routes (Login/Signup)
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

    // 1. If trying to access a protected route without a session, redirect to login
    if (!sessionCookie && isProtectedRoute) {
        const url = new URL("/login", request.url);
        url.searchParams.set("callbackURL", pathname);
        return NextResponse.redirect(url);
    }

    // 2. If already logged in and trying to access auth pages, redirect to home
    if (sessionCookie && isAuthRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 3. All other routes (/, /Profile, /Explore, etc.) are now public for viewing
    return NextResponse.next();
}


export const config = {
    // Match all paths except static files and api
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
