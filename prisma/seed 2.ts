import "dotenv/config";

import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

/**
 * Creates the first admin.
 *
 * Goes through Better Auth's own sign-up rather than inserting a row directly,
 * so the password hash format is whatever Better Auth expects today. Hand-
 * rolling the hash is how seeded accounts end up unable to log in.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const name = process.env.ADMIN_NAME ?? "Admin";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: "admin", isActive: true },
    });
    console.log(`✓ admin already existed, ensured role=admin: ${email}`);
    return;
  }

  await auth.api.signUpEmail({ body: { email, password, name } });

  // signUpEmail cannot set role — `input: false` in auth.ts blocks it on
  // purpose, so nobody can self-promote through the public sign-up endpoint.
  await prisma.user.update({
    where: { email },
    data: { role: "admin", emailVerified: true },
  });

  console.log(`✓ created admin: ${email}`);
  console.log("  change the password after first login");
}

main()
  .catch((error) => {
    console.error("seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
