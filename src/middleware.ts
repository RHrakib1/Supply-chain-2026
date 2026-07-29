import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const MASTER_SUPER_ADMIN_EMAIL = "rakibhasanmd457@gmail.com";

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
]);

const isAdminOnlyRoute = createRouteMatcher([
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
  const { userId, sessionClaims } = await auth();

  // Unauthenticated guard: redirect to /sign-in if attempting to access protected routes
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Extract user primary email
  let primaryEmail = (
    (sessionClaims as Record<string, unknown>)?.email ||
    (sessionClaims as Record<string, unknown>)?.primaryEmail ||
    (sessionClaims as Record<string, unknown>)?.email_address ||
    ""
  ) as string;

  if (userId && !primaryEmail) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      primaryEmail = (
        user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ||
        user.emailAddresses[0]?.emailAddress ||
        ""
      ).toLowerCase();
    } catch (err) {
      console.warn("Notice fetching Clerk user in middleware:", err);
    }
  } else {
    primaryEmail = primaryEmail.toLowerCase();
  }

  const isMasterSuperAdmin = primaryEmail === MASTER_SUPER_ADMIN_EMAIL;

  // Strict Master Super Admin Email Protection for /super-admin
  if (userId && isSuperAdminRoute(req)) {
    if (!isMasterSuperAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Extract user role from sessionClaims publicMetadata, unsafeMetadata, or metadata
  const publicRole = (sessionClaims?.publicMetadata as Record<string, unknown>)?.role as string;
  const unsafeRole = (sessionClaims?.unsafeMetadata as Record<string, unknown>)?.role as string;
  const metadataRole = (sessionClaims?.metadata as Record<string, unknown>)?.role as string;

  // Master email is always super_admin. For others, default to 'admin' unless explicitly 'user', 'driver', 'retailer', or 'dealer'
  const role = isMasterSuperAdmin 
    ? "super_admin" 
    : (publicRole || unsafeRole || metadataRole || "admin");

  // 1. Role 'user' or 'driver': Blocked from admin & super-admin pages, strictly redirected to /route-tracking
  if ((role === "user" || role === "driver") && !req.nextUrl.pathname.startsWith("/route-tracking")) {
    if (!isPublicRoute(req)) {
      return NextResponse.redirect(new URL("/route-tracking", req.url));
    }
  }

  // 2. Role 'retailer' or 'dealer': Allowed access to /orders and /route-tracking, blocked from admin/super-admin pages
  if ((role === "retailer" || role === "dealer") && (isAdminOnlyRoute(req) || isSuperAdminRoute(req))) {
    return NextResponse.redirect(new URL("/orders", req.url));
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