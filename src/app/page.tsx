import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SURFACE, TEXT } from "@/lib/design";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Next.js Starter</h1>
        <p className={cn("mt-2 text-sm", TEXT.subtle)}>
          Better Auth · Prisma · TanStack Query · enforced quality gates.
        </p>
      </div>

      <div className={cn(SURFACE.panel, "p-5")}>
        <h2 className="text-sm font-medium">First run</h2>
        <ol className={cn("mt-2 list-decimal space-y-1 pl-5 text-sm", TEXT.subtle)}>
          <li>
            Copy <code className="font-mono text-xs">.env.example</code> to{" "}
            <code className="font-mono text-xs">.env</code>, set{" "}
            <code className="font-mono text-xs">DATABASE_URL</code>
          </li>
          <li>
            <code className="font-mono text-xs">pnpm db:migrate</code> then{" "}
            <code className="font-mono text-xs">pnpm db:seed</code>
          </li>
          <li>Sign in with the seeded admin, then change its password</li>
        </ol>
      </div>

      <div className="flex gap-3">
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
        <Link href="/signup">
          <Button variant="outline">Create account</Button>
        </Link>
      </div>
    </main>
  );
}
