import type { AppRole } from "./session";

export type Permission = "dashboard:view" | "cars:write" | "leads:write" | "users:manage";

const permissions: Record<AppRole, Permission[]> = {
  ADMIN: ["dashboard:view", "cars:write", "leads:write", "users:manage"],
  EDITOR: ["dashboard:view", "cars:write"],
  SALES: ["dashboard:view", "leads:write"],
};

export function can(role: AppRole, permission: Permission) {
  return permissions[role].includes(permission);
}
