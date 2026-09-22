import { describe, expect, it } from "vitest";
import { can } from "./permissions";

describe("RBAC permissions", () => {
  it("allows editors to manage cars but not users", () => {
    expect(can("EDITOR", "cars:write")).toBe(true);
    expect(can("EDITOR", "users:manage")).toBe(false);
  });
  it("keeps sales users focused on leads", () => {
    expect(can("SALES", "leads:write")).toBe(true);
    expect(can("SALES", "cars:write")).toBe(false);
  });
});
