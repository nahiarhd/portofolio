import { isAdmin } from "@/lib/auth-permissions";
import { STATUS_TONE, SURFACE, TEXT } from "@/lib/design";
import { requirePortalUser } from "@/lib/portal-session";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const { user } = await requirePortalUser();
  // The layout already redirected an unauthenticated visitor; this is only to
  // satisfy the type narrowing.
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className={cn("mt-1 text-sm", TEXT.subtle)}>
          Signed in and past both gates: the proxy cookie check and the
          database session check.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={cn(SURFACE.panel, "p-5")}>
          <h2 className="text-sm font-medium">Your role</h2>
          <span
            className={cn(
              "mt-2 inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
              isAdmin(user) ? STATUS_TONE.success : STATUS_TONE.neutral
            )}
          >
            {user.role}
          </span>
          <p className={cn("mt-3 text-sm", TEXT.subtle)}>
            {isAdmin(user)
              ? "Admin — passes canManageUsers()."
              : "User — canManageUsers() returns false."}
          </p>
        </div>

        <div className={cn(SURFACE.panel, "p-5")}>
          <h2 className="text-sm font-medium">Next steps</h2>
          <ul className={cn("mt-2 list-disc space-y-1 pl-5 text-sm", TEXT.subtle)}>
            <li>Read AGENTS.md before writing code</li>
            <li>
              Run <code className="font-mono text-xs">pnpm verify</code> before saying it works
            </li>
            <li>Delete the example proxy route if unused</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
