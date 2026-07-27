import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isRestrictedAdminRoute = createRouteMatcher([
  '/',
  '/inventory',
  '/inventory/(.*)',
  '/retailers',
  '/retailers/(.*)',
  '/analytics',
  '/analytics/(.*)',
  '/settings',
  '/settings/(.*)',
]);

const isSuperAdminRoute = createRouteMatcher([
  '/super-admin',
  '/super-admin/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();

  // Extract user role from sessionClaims metadata if present
  const role =
    (sessionClaims?.metadata as Record<string, unknown>)?.role ||
    (sessionClaims?.publicMetadata as Record<string, unknown>)?.role ||
    (sessionClaims?.unsafeMetadata as Record<string, unknown>)?.role;

  // Protect Super Admin Portal (/super-admin) exclusively for super_admin role
  if (isSuperAdminRoute(req) && role !== "super_admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect normal 'user' role attempting to open restricted admin pages to /route-tracking
  if (role === "user" && isRestrictedAdminRoute(req)) {
    return NextResponse.redirect(new URL("/route-tracking", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js|json|jsx?|tsx?|png|jpg|jpeg|gif|svg|webp|ico|csv|txt|pdf)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};