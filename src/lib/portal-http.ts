import { NextResponse } from "next/server";

/**
 * One JSON error shape for every route, so clients never have to guess whether
 * the failure field is `error`, `message`, or `detail`.
 */
export interface PortalErrorBody {
  detail: string;
  details?: unknown;
}

export function portalError(
  status: number,
  detail: string,
  details?: unknown
): NextResponse<PortalErrorBody> {
  return NextResponse.json(details === undefined ? { detail } : { detail, details }, { status });
}

export const portalBadRequest = (detail: string, details?: unknown) =>
  portalError(400, detail, details);
export const portalUnauthorized = (detail = "Not authenticated") => portalError(401, detail);
export const portalForbidden = (detail = "Not permitted") => portalError(403, detail);
export const portalNotFound = (detail = "Not found") => portalError(404, detail);
export const portalValidationError = (detail: string, details?: unknown) =>
  portalError(422, detail, details);
export const portalBadGateway = (detail: string) => portalError(502, detail);

/**
 * Parse a JSON body without throwing. Returns a discriminated result so callers
 * handle malformed input explicitly instead of letting a parse error surface as
 * an opaque 500.
 */
export async function readJsonBody<T>(
  request: Request
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse<PortalErrorBody> }> {
  try {
    return { ok: true, data: (await request.json()) as T };
  } catch {
    return { ok: false, response: portalBadRequest("Body must be valid JSON") };
  }
}
