import { proxyServiceRequest, type ServiceTarget } from "@/lib/services/service-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Worked example of the proxy pattern — copy this file per external service.
 *
 * The browser calls `/api/services/example/<path>` with its session cookie and
 * never sees EXAMPLE_API_KEY. Delete this route if the project has no external
 * keyed API.
 */
const EXAMPLE: ServiceTarget = {
  label: "Example",
  baseUrlEnv: "EXAMPLE_API_URL",
  apiKeyEnv: "EXAMPLE_API_KEY",
};

type Ctx = { params: Promise<{ path: string[] }> };

async function handler(request: Request, context: Ctx) {
  const { path } = await context.params;
  return proxyServiceRequest(request, EXAMPLE, path);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
