// services/auth.service.js
import crypto from "crypto";
import { signAccessToken } from "../utils/jwt.js";
import { createSession, rotateRefresh, revokeSession, revokeAllUserSessions } from "./session.service.js";
import { cookieNames, accessCookieOpts, refreshCookieOpts, clearCookieOpts, clearRefreshCookieOpts } from "../utils/cookies.js";
//מיד אחרי התחברות או הרשמה יצירת סשן
export async function loginFlow({ res, user, userAgent, ipHash }) {
  const sessionId = crypto.randomUUID();
  const rolesFromUser = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
  const roles = [...new Set([...rolesFromUser, ...(user.storeId ? ["seller"] : [])])];
  const role = user.role ?? (user.storeId ? "seller" : null);

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

  res.cookie(cookieNames.access, access, accessCookieOpts());
  res.cookie(cookieNames.refresh, refreshToken, refreshCookieOpts());

  return { ok: true };
}

//כשהטוקן הקצר פג מיצר חדש אם הסשן קיים
export async function refreshFlow({ req, res }) {
  const token = req.cookies?.[cookieNames.refresh];
  if (!token) throw new Error("Missing refresh");
console.log("to",token)
  const { session, newToken } = await rotateRefresh({ presentedToken: token });
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
console.log("access",access)
  res.cookie(cookieNames.access, access, accessCookieOpts());
  res.cookie(cookieNames.refresh, newToken, refreshCookieOpts());

  return { ok: true, session };
}



//מבטל סשן במסד
export async function logoutFlow({ res, sessionId }) {
  if (sessionId) await revokeSession(sessionId);
  res.cookie(cookieNames.access, "", clearCookieOpts());
  res.cookie(cookieNames.refresh, "", clearRefreshCookieOpts()); // חשוב בגלל path שונה
  return { ok: true };
}
//יציאה מכל הסשנים
export async function logoutAllFlow({ res, userId }) {
  await revokeAllUserSessions(userId);
  res.cookie(cookieNames.access, "", clearCookieOpts());
  res.cookie(cookieNames.refresh, "", clearRefreshCookieOpts());
  return { ok: true };
}
