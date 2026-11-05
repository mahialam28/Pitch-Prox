import { NextResponse } from "next/server";

// Client preview (DEMO_MODE=true): there's no sign-in screen; visitors pick a role on /demo
const demoMode = () => process.env.DEMO_MODE === "true";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return demoMode() ? NextResponse.redirect(new URL("/demo", request.url)) : NextResponse.next();
  }
  const hasSession = request.cookies.has("pitchprox_session");
  if (!hasSession) {
    return NextResponse.redirect(new URL(demoMode() ? "/demo" : "/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/user/:path*", "/internal-sales-representative/:path*", "/super-admin/:path*", "/onboarding/:path*", "/onboarding"],
};
