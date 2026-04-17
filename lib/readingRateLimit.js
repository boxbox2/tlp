import { createHash } from "node:crypto";

const MAX_READINGS_PER_HOUR = 10;
const HOUR_IN_MS = 60 * 60 * 1000;
const STORE_KEY = "__tarotReadingRateLimitStore";

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = new Map();
  }

  return globalThis[STORE_KEY];
}

function getClientIdentifier(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();
  const userAgent = request.headers.get("user-agent")?.trim();
  const rawIdentifier = firstForwardedIp || realIp || `anonymous:${userAgent || "unknown"}`;

  return createHash("sha256").update(rawIdentifier).digest("hex");
}

function getRecentTimestamps(store, identifier, now) {
  const timestamps = store.get(identifier) ?? [];
  const recentTimestamps = timestamps.filter((timestamp) => now - timestamp < HOUR_IN_MS);

  if (recentTimestamps.length > 0) {
    store.set(identifier, recentTimestamps);
  } else {
    store.delete(identifier);
  }

  return recentTimestamps;
}

function pruneStore(store, now) {
  if (store.size < 200) {
    return;
  }

  for (const [identifier, timestamps] of store.entries()) {
    const recentTimestamps = timestamps.filter((timestamp) => now - timestamp < HOUR_IN_MS);

    if (recentTimestamps.length > 0) {
      store.set(identifier, recentTimestamps);
    } else {
      store.delete(identifier);
    }
  }
}

function buildSnapshot(timestamps, allowed) {
  const used = Math.min(timestamps.length, MAX_READINGS_PER_HOUR);
  const remaining = Math.max(0, MAX_READINGS_PER_HOUR - used);
  const resetAt =
    timestamps.length >= MAX_READINGS_PER_HOUR
      ? new Date(timestamps[0] + HOUR_IN_MS).toISOString()
      : null;

  return {
    limit: MAX_READINGS_PER_HOUR,
    used,
    remaining,
    isLimited: remaining === 0,
    allowed,
    resetAt
  };
}

export function getReadingRateLimit(request) {
  const now = Date.now();
  const store = getStore();

  pruneStore(store, now);

  const identifier = getClientIdentifier(request);
  const timestamps = getRecentTimestamps(store, identifier, now);

  return buildSnapshot(timestamps, true);
}

export function consumeReadingRateLimit(request) {
  const now = Date.now();
  const store = getStore();

  pruneStore(store, now);

  const identifier = getClientIdentifier(request);
  const timestamps = getRecentTimestamps(store, identifier, now);

  if (timestamps.length >= MAX_READINGS_PER_HOUR) {
    return buildSnapshot(timestamps, false);
  }

  const nextTimestamps = [...timestamps, now];
  store.set(identifier, nextTimestamps);

  return buildSnapshot(nextTimestamps, true);
}
