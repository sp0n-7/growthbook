import { posix } from "path";

// Normalize before checking so "org_A/../org_B/..." can't escape the org's
// folder. Returns null if it does.
export function getOrgScopedPath(
  rawPath: string,
  orgId: string
): string | null {
  const normalized = posix.normalize(rawPath.replace(/^\/+/, ""));
  if (normalized !== orgId && !normalized.startsWith(`${orgId}/`)) {
    return null;
  }
  return normalized;
}
