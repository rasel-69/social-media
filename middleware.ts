import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get("better-auth.session_token") || 
                         request.cookies.get("__Secure-better-auth.session_token");

    const { pathname } = request.nextUrl;

    // Define public routes that don't require authentication
    const isPublicRoute = pathname.startsWith("/login") || 
                          pathname.startsWith("/signup") ||
                          pathname.startsWith("/api/auth");
    
    // Check if the request is for a static asset or internal Next.js path
    const isStaticAsset = pathname.startsWith("/_next") || 
                          pathname.includes("/favicon.ico") ||
                          pathname.startsWith("/api/uploadthing");

    if (isStaticAsset) return NextResponse.next();

    // If there's no session and it's not a public route, redirect to login
    if (!sessionCookie && !isPublicRoute) {
        const url = new URL("/login", request.url);
        // Only set callback if it's a page navigation, not an API call
        if (!pathname.startsWith("/api")) {
            url.searchParams.set("callbackURL", pathname);
        }
        return NextResponse.redirect(url);
    }

    // If there is a session and the user is trying to access auth pages, redirect to home
    if (sessionCookie && (pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Match all paths except static files and api/auth
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
