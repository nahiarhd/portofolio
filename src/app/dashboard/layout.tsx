import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { SignOutButton } from "@/components/sign-out-button";
import { TEXT } from "@/lib/design";
import { requirePortalUser } from "@/lib/portal-session";
import { cn } from "@/lib/utils";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Middleware only proved a cookie exists. This is the real check — it hits
  // the DB and rejects deleted or disabled accounts.
  const { user, error } = await requirePortalUser();
  if (error || !user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className={cn("text-xs", TEXT.faint)}>
              {user.email} · {user.role}
            </p>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
