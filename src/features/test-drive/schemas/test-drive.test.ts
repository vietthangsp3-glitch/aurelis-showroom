import { describe, expect, it } from "vitest";
import { scheduledAtFromInput, testDriveSchema } from "./test-drive";

function payload() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const date = tomorrow.toISOString().slice(0, 10);
  return {
    name: "Nguyễn Văn An",
    phone: "0912345678",
    email: "",
    variantId: "variant-1",
    showroomId: "showroom-1",
    date,
    time: "10:00",
    note: "",
    source: "test",
    landingPage: "",
    referrer: "",
    submissionKey: "00000000-0000-4000-8000-000000000001",
    website: "",
    consent: "on",
  };
}

describe("testDriveSchema", () => {
  it("validates a normal booking", () => {
    const parsed = testDriveSchema.safeParse(payload());
    expect(parsed.success).toBe(true);
  });

  it("rejects honeypot content", () => {
    expect(
      testDriveSchema.safeParse({ ...payload(), website: "bot" }).success,
    ).toBe(false);
  });

  it("rejects past schedules", () => {
    const input = testDriveSchema.parse({ ...payload(), date: "2020-01-01" });
    expect(() => scheduledAtFromInput(input)).toThrow("INVALID_SCHEDULE");
  });

  it("rejects times outside supported half-hour slots", () => {
    const input = testDriveSchema.parse({ ...payload(), time: "10:15" });
    expect(() => scheduledAtFromInput(input)).toThrow("INVALID_SCHEDULE");
  });
});
