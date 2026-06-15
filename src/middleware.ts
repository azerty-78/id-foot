import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

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
  function middleware() {
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
