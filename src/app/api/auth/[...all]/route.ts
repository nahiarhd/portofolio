import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Exposes every Better Auth endpoint (sign-in, sign-up, sign-out, session…).
export const { GET, POST } = toNextJsHandler(auth);
