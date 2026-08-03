import { headers } from "next/headers";
import type { NextResponse } from "next/server";

import { auth } from "./auth";
import { canManageUsers, type PermissionSubject } from "./auth-permissions";
import { portalForbidden, portalUnauthorized } from "./portal-http";
import { prisma } from "./prisma";

export interface PortalUser extends PermissionSubject {
  id: string;
  email: string;
  name: string;
}

/**
 * Resolve the signed-in user for a route handler.
 *
 * The proxy only checks that a session cookie exists — it deliberately
 * does no crypto or DB work. This is where real authorization happens, so
 * every mutating route must call one of these guards.
 */
export async function requirePortalUser(): Promise<
  { user: PortalUser; error: null } | { user: null; error: NextResponse }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { user: null, error: portalUnauthorized() };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  if (!user) return { user: null, error: portalUnauthorized("Session user no longer exists") };
  if (!user.isActive) return { user: null, error: portalForbidden("Account is disabled") };

  return { user, error: null };
}

/** As above, then requires the admin role. */
export async function requireAdminUser(): Promise<
  { user: PortalUser; error: null } | { user: null; error: NextResponse }
> {
  const result = await requirePortalUser();
  if (result.error) return result;
  if (!canManageUsers(result.user)) {
    return { user: null, error: portalForbidden("Admin role required") };
  }
  return result;
}
