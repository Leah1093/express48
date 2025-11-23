import { Session } from "../models/session.js";
import { User } from "../models/user.js";
import { Store } from "../models/store.js";

export async function syncUserSessions(userId) {
  const user = await User.findById(userId).select("role roles");
  if (!user) throw new Error("User not found");

  const store = await Store.findOne({ userId }).select("_id sellerId");

  const update = {
    role: user.role ?? null,
    roles: user.roles ?? [],
    sellerId: store?.sellerId ?? null,
    storeId: store?._id ?? null,
    $currentDate: { updatedAt: true },
  };

  const result = await Session.updateMany(
    { userId, status: "active" },
    update
  );

  return {
    ok: true,
    matched: result.matchedCount,
    modified: result.modifiedCount,
  };
}
