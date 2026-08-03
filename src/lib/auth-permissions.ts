/**
 * Roles today are just `admin` and `user`.
 *
 * This module exists so the *call sites* never test `role === "admin"`
 * directly. When this grows into groups and permission strings, only this file
 * changes — every `canManageUsers(user)` caller keeps working.
 */

export type Role = "admin" | "user";

export const ROLES: readonly Role[] = ["admin", "user"] as const;

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export interface PermissionSubject {
  role: string;
  isActive: boolean;
}

export function isAdmin(user: PermissionSubject): boolean {
  return user.isActive && user.role === "admin";
}

/** Admin-only today; becomes a permission lookup when groups arrive. */
export function canManageUsers(user: PermissionSubject): boolean {
  return isAdmin(user);
}

/** Any active account. */
export function canAccessDashboard(user: PermissionSubject): boolean {
  return user.isActive;
}
