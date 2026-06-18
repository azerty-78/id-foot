import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import {
  isScanOnlyAdminPath,
  isScanOnlyApiPath,
  SCAN_ONLY_HOME,
} from "@/lib/auth/scanOnlyAccess";

const PUBLIC_ADMIN_PATHS = ["/admin/signin", "/admin/signout"];

const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/competitions/register",
  "/api/competitions/by-slug/",
];

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (token?.scanOnly && token.active !== false) {
      if (pathname.startsWith("/admin") && !isScanOnlyAdminPath(pathname)) {
        return NextResponse.redirect(new URL(SCAN_ONLY_HOME, req.url));
      }

      if (
        pathname.startsWith("/api/") &&
        !isPublicApiPath(pathname) &&
        !isScanOnlyApiPath(pathname)
      ) {
        return NextResponse.json(
          { error: "Accès réservé au scanner QR." },
          { status: 403 },
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
          return true;
        }

        if (isPublicApiPath(pathname)) {
          return true;
        }

        if (pathname.startsWith("/god-mode") || pathname.startsWith("/api/god-mode")) {
          return true;
        }

        return Boolean(token?.sub && token.active !== false);
      },
    },
    pages: {
      signIn: "/admin/signin",
    },
  },
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/competitions/:path*",
    "/api/teams/:path*",
    "/api/players/:path*",
    "/api/qr/:path*",
    "/api/users/:path*",
  ],
};
