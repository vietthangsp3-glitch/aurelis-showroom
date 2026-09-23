import { describe, expect, it } from "vitest";
import { isAllowedHttpsMediaUrl } from "./media-url";

describe("media URL allowlist", () => {
  it("accepts trusted HTTPS hosts", () => {
    expect(
      isAllowedHttpsMediaUrl("https://images.unsplash.com/photo.jpg"),
    ).toBe(true);
    expect(
      isAllowedHttpsMediaUrl(
        "https://res.cloudinary.com/demo/image/upload/car.jpg",
      ),
    ).toBe(true);
  });

  it("rejects HTTP and untrusted hosts", () => {
    expect(isAllowedHttpsMediaUrl("http://images.unsplash.com/photo.jpg")).toBe(
      false,
    );
    expect(isAllowedHttpsMediaUrl("https://example.com/car.jpg")).toBe(false);
    expect(isAllowedHttpsMediaUrl("file:///etc/passwd")).toBe(false);
  });
});
