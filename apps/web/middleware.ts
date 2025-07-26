import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const refreshToken = request.cookies.get("__refresh_token__")?.value;
    let authRoute;
    for (const route of ["/signup", "/login", "/auth-success"]) {
        if (pathname.includes(route)) {
            authRoute = true;
        }
    }

    if (authRoute && refreshToken) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (!authRoute && !refreshToken) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
