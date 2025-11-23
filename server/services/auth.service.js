import crypto from "crypto";
import { signAccessToken } from "../utils/jwt.js";
import {
  createSession,
  rotateRefresh,
  revokeSession,
  revokeAllUserSessions,
} from "./session.service.js";
import {
  cookieNames,
  accessCookieOpts,
  refreshCookieOpts,
  clearCookieOpts,
  clearRefreshCookieOpts,
} from "../utils/cookies.js";
import { CustomError } from "../utils/CustomError.js";

// ----- Helpers -----
function setAuthCookies(res, access, refresh) {
  res.cookie(cookieNames.access, access, accessCookieOpts());
  if (refresh) {
    res.cookie(cookieNames.refresh, refresh, refreshCookieOpts());
  }
}

function clearAuthCookies(res) {
  res.cookie(cookieNames.access, "", clearCookieOpts());
  res.cookie(cookieNames.refresh, "", clearRefreshCookieOpts());
}

// ----- Flows -----

// התחברות או הרשמה → יצירת סשן
export async function loginFlow({ res, user, userAgent, ipHash }) {
  const sessionId = crypto.randomUUID();

  const rolesFromUser = Array.isArray(user.roles)
    ? user.roles
    : user.role
    ? [user.role]
    : [];

  const roles = [
    ...new Set([...rolesFromUser, ...(user.storeId ? ["seller"] : [])]),
  ];

  const role = user.role ?? (user.storeId ? "seller" : "user");

  const { refreshToken } = await createSession({
    userId: user._id,
    sessionId,
    userAgent,
    ipHash,
    role,
    roles,
    sellerId: user.sellerId ?? null,
    storeId: user.storeId ?? null,
  });

  const access = signAccessToken({
    user: {
      _id: user._id,
      role,
      roles,
      sellerId: user.sellerId ?? null,
      storeId: user.storeId ?? null,
    },
    sessionId,
  });

  setAuthCookies(res, access, refreshToken);

  return { ok: true };
}

// חידוש טוקן קצר אם הסשן עדיין קיים
export async function refreshFlow({ req, res }) {
  const token = req.cookies?.[cookieNames.refresh];
  if (!token) throw new CustomError("Missing refresh token", 401);

  const { session, newToken } = await rotateRefresh({ presentedToken: token });

  if (!session) throw new CustomError("Invalid session", 401);

  const access = signAccessToken({
    user: {
      _id: session.userId,
      role: session.role ?? null,
      roles: session.roles ?? [],
      sellerId: session.sellerId ?? null,
      storeId: session.storeId ?? null,
    },
    sessionId: session.sessionId,
  });

  setAuthCookies(res, access, newToken);

  return { ok: true, session };
}

// יציאה מסשן יחיד
export async function logoutFlow({ res, sessionId }) {
  if (sessionId) {
    await revokeSession(sessionId);
  }
  clearAuthCookies(res);
  return { ok: true };
}

// יציאה מכל הסשנים
export async function logoutAllFlow({ res, userId }) {
  await revokeAllUserSessions(userId);
  clearAuthCookies(res);
  return { ok: true };
}
