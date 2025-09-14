// services/session.service.js
import { Session } from "../models/session.js";
import { buildRefreshToken, splitRefreshToken, hashRefreshSecret, compareRefreshSecret } from "../utils/refresh.js";

const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || "30d";
const ttlMs = parseTtlMs(REFRESH_TTL);

//יצירת סשן
export async function createSession({ userId, sessionId, userAgent, ipHash, role, roles, sellerId, storeId }) {
  const refreshToken = buildRefreshToken(sessionId);
  const { secret } = splitRefreshToken(refreshToken);
  const refreshHash = await hashRefreshSecret(secret);

  const expiresAt = new Date(Date.now() + ttlMs);

  await Session.create({
    sessionId,
    userId,
    role: role ?? null,
    roles: Array.isArray(roles) ? roles : (role ? [role] : []),
    sellerId: sellerId ?? null,
    storeId: storeId ?? null,
    refreshHash,
    status: "active",
    expiresAt,
    lastUsedAt: new Date(),
    userAgent,
    ipHash,
    rotatingCounter: 0,
  });

  return { refreshToken, expiresAt };
}

export async function rotateRefresh({ presentedToken }) {
  const { sessionId, secret } = splitRefreshToken(presentedToken);
  const sess = await Session.findOne({ sessionId });
  if (!sess) throw new Error("Session not found");
  if (sess.status !== "active") throw new Error("Session not active");
  if (sess.expiresAt <= new Date()) {
    await Session.updateOne({ _id: sess._id }, { status: "expired", $currentDate: { updatedAt: true } });
    throw new Error("Session expired");
  }

  const ok = await compareRefreshSecret(secret, sess.refreshHash);
  if (!ok) {
    if (sess.prevRefreshHash) {
      const reuse = await compareRefreshSecret(secret, sess.prevRefreshHash);
      if (reuse) await Session.updateOne({ _id: sess._id }, { status: "revoked", $currentDate: { updatedAt: true } });
    }
    throw new Error("Invalid refresh");
  }

  const newToken = buildRefreshToken(sessionId);
  const { secret: newSecret } = splitRefreshToken(newToken);
  const newHash = await hashRefreshSecret(newSecret);

  const rolling = process.env.REFRESH_ROLLING === "true";

  await Session.updateOne(
    { _id: sess._id },
    {
      prevRefreshHash: sess.refreshHash,
      refreshHash: newHash,
      rotatingCounter: (sess.rotatingCounter || 0) + 1,
      lastUsedAt: new Date(),
      ...(rolling ? { expiresAt: new Date(Date.now() + ttlMs) } : {}),
      $currentDate: { updatedAt: true },
    }
  );

  return { session: sess, newToken };
}
//יציאה מסשן ספציפי
export async function revokeSession(sessionId) {
  await Session.updateOne({ sessionId }, { status: "revoked", $currentDate: { updatedAt: true } });
}
//יציאה מכל הסשנים
export async function revokeAllUserSessions(userId) {
  await Session.updateMany({ userId, status: "active" }, { status: "revoked", $currentDate: { updatedAt: true } });
}
//ניהול זמני תפוגה
function parseTtlMs(ttl) {
  if (/^\d+$/.test(ttl)) return Number(ttl) * 1000;
  const m = ttl.match(/^(\d+)([smhd])$/i);
  if (!m) return 30 * 24 * 3600 * 1000;
  const n = Number(m[1]);
  const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * map[m[2].toLowerCase()];
}
