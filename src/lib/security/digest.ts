import { createHmac } from "node:crypto";

function digestSecret() {
  const value = process.env.IP_HASH_SECRET || process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "IP_HASH_SECRET hoặc SESSION_SECRET chưa được cấu hình an toàn.",
      );
    }
    return "development-only-digest-secret-change-me";
  }
  return value;
}

export function digestIdentifier(value: string) {
  return createHmac("sha256", digestSecret()).update(value).digest("hex");
}
