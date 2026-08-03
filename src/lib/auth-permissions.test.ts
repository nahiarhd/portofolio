import { describe, expect, it } from "vitest";

import { canAccessDashboard, canManageUsers, isAdmin, isRole } from "./auth-permissions";

const admin = { role: "admin", isActive: true };
const user = { role: "user", isActive: true };
const disabledAdmin = { role: "admin", isActive: false };

describe("isRole", () => {
  it("accepts known roles and rejects anything else", () => {
    expect(isRole("admin")).toBe(true);
    expect(isRole("user")).toBe(true);
    expect(isRole("superuser")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});

describe("permission checks", () => {
  it("grants management to an active admin only", () => {
    expect(canManageUsers(admin)).toBe(true);
    expect(canManageUsers(user)).toBe(false);
  });

  it("denies a deactivated admin — isActive beats role", () => {
    expect(isAdmin(disabledAdmin)).toBe(false);
    expect(canManageUsers(disabledAdmin)).toBe(false);
    expect(canAccessDashboard(disabledAdmin)).toBe(false);
  });

  it("lets any active account reach the dashboard", () => {
    expect(canAccessDashboard(user)).toBe(true);
  });
});
