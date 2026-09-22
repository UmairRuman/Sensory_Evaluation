import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = ["/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!isPublic && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && req.auth) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Guards the host GUI only. Panelist routes (/s/**), NextAuth's own API routes, and static
  // assets are excluded so the public scoring flow never depends on a host session.
  matcher: ["/((?!s/|api/auth|api/s/|_next/static|_next/image|favicon.ico).*)"],
};
