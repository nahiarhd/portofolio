import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "./prisma";

const secret = process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET;

if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("BETTER_AUTH_SECRET is required in production");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  secret: secret ?? "dev-only-insecure-secret-do-not-ship",
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  // `input: false` keeps these server-owned — a client cannot promote itself to
  // admin by posting a role field during sign-up.
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "user", input: false },
      isActive: { type: "boolean", defaultValue: true, input: false },
      lastLoginAt: { type: "date", required: false, input: false },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    // Short cookie cache avoids a DB read on every request without letting a
    // revoked session linger for long.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await prisma.user.update({
            where: { id: session.userId },
            data: { lastLoginAt: new Date() },
          });
        },
      },
    },
  },
});
