"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";
import { SURFACE, TEXT } from "@/lib/design";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    // Mirrors minPasswordLength in src/lib/auth.ts. The server is still the
    // authority — this only saves a round trip.
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    setPending(true);
    setError(null);

    const { error: signUpError } = await signUp.email({ email, password, name });

    if (signUpError) {
      setError(signUpError.message ?? "Could not create the account");
      setPending(false);
      return;
    }

    // New accounts are role=user; auth.ts marks role as input:false so this
    // endpoint cannot be used to self-promote.
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={handleSubmit} className={cn(SURFACE.panelStrong, "w-full max-w-sm p-6")}>
        <h1 className="text-lg font-semibold">Create account</h1>
        <p className={cn("mt-1 text-sm", TEXT.subtle)}>Accounts start with the user role.</p>

        <div className="mt-5 space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="mt-5 w-full" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>

        <p className={cn("mt-4 text-center text-sm", TEXT.subtle)}>
          Already have one?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
