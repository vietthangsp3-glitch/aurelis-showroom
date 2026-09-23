const defaultMediaHosts = [
  "images.unsplash.com",
  "res.cloudinary.com",
  "cdn.simpleicons.org",
  "cdn.worldvectorlogo.com",
  "upload.wikimedia.org",
];

export function allowedMediaHosts() {
  const configured = (process.env.ALLOWED_MEDIA_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  return new Set([...defaultMediaHosts, ...configured]);
}

export function isAllowedHttpsMediaUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return allowedMediaHosts().has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function assertAllowedHttpsMediaUrl(value: string, label = "URL") {
  if (!isAllowedHttpsMediaUrl(value)) {
    throw new Error(
      `${label} phải dùng HTTPS và thuộc hostname media được cho phép.`,
    );
  }
  return value;
}
