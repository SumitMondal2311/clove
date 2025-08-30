import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "./configs/all-routes";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = req.cookies.get("__refresh_token__")?.value;

    if (AUTH_ROUTES.some((route) => pathname.includes(route))) {
        if (token) {
            return NextResponse.redirect(
                new URL(`/dashboard?redirect=${encodeURIComponent(pathname)}`, req.nextUrl.origin)
            );
        }
    }

    if (PROTECTED_ROUTES.some((route) => pathname.includes(route))) {
        if (!token) {
            return NextResponse.redirect(
                new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.nextUrl.origin)
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
