import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const MASTER_SUPER_ADMIN_EMAIL = "rakibhasanmd457@gmail.com";

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
]);

const isRestrictedAdminRoute = createRouteMatcher([
  '/',
  '/inventory',
  '/inventory/(.*)',
  '/orders',
  '/orders/(.*)',
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

  // Strict Master Super Admin Email Protection for /super-admin
  if (userId && isSuperAdminRoute(req)) {
    let primaryEmail = (
      (sessionClaims as Record<string, unknown>)?.email ||
      (sessionClaims as Record<string, unknown>)?.primaryEmail ||
      (sessionClaims as Record<string, unknown>)?.email_address ||
      ""
    ) as string;

    if (!primaryEmail) {
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

    if (primaryEmail !== MASTER_SUPER_ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/inventory", req.url));
    }
  }

  // Extract user role from sessionClaims metadata if present
  const role =
    (sessionClaims?.metadata as Record<string, unknown>)?.role ||
    (sessionClaims?.publicMetadata as Record<string, unknown>)?.role ||
    (sessionClaims?.unsafeMetadata as Record<string, unknown>)?.role;

  // Redirect normal 'user' role attempting to open restricted admin or super-admin pages to /route-tracking
  if (role === "user" && (isRestrictedAdminRoute(req) || isSuperAdminRoute(req))) {
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