import crypto from "crypto";
import { AffiliateProfile } from "../models/AffiliateProfile.js";
import { CustomError } from "../utils/CustomError.js";
import mongoose from "mongoose";
import {
  AffiliateClick,
  AffiliateClickUnique,
} from "../models/AffiliateProfile.js";

const DEFAULT_COMMISSION_RATE = Number(
  process.env.AFFILIATE_DEFAULT_RATE ?? 0.05
);
const SALT = String(process.env.AFFILIATE_CLICK_SALT || "change-me");

function sha256(str) {
  return crypto.createHash("sha256").update(String(str)).digest("hex");
}

function getDayStr(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function genCode(len = 6) {
  return crypto.randomBytes(16).toString("hex").slice(0, len).toUpperCase();
}

async function genUniqueCode() {
  for (let i = 0; i < 10; i++) {
    const code = genCode(6);
    const exists = await AffiliateProfile.exists({ code });
    if (!exists) return code;
  }
  throw new CustomError("Failed to generate unique affiliate code", 500);
}

function hasAcceptedAllTerms(profile) {
  const c = profile?.terms?.confirmations;
  return Boolean(
    profile?.terms?.acceptedAt &&
      profile?.terms?.version &&
      c?.programExplanation &&
      c?.noSelfPurchase &&
      c?.noMisleadingAds &&
      c?.privacyRules &&
      c?.payoutPolicy
  );
}
function parseDayStr(str) {
  // expects YYYY-MM-DD
  const s = String(str || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}

function getDayStrLocal(d = new Date()) {
  // נשאר בקו שלך: יום לפי השרת בזמן יצירת הקליק
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(dayStr, delta) {
  const [y, m, d] = dayStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return getDayStrLocal(dt);
}

function buildDayRange(fromDay, toDay) {
  const out = [];
  let cur = fromDay;
  while (cur <= toDay) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}


export class AffiliateService {
  /**
   * שלב 1: המשתמש מאשר תנאים.
   * יוצר פרופיל אם לא קיים, ושומר terms.
   * נשאר בסטטוס draft עד apply.
   */
  static async acceptTerms(userId, payload, meta = {}) {
    if (!userId) throw new CustomError("Authorization required", 401);

    const version = payload?.version;
    const confirmations = payload?.confirmations;

    if (!version) throw new CustomError("Missing terms version", 400);
    if (!confirmations) throw new CustomError("Missing confirmations", 400);

    const allTrue =
      confirmations.programExplanation === true &&
      confirmations.noSelfPurchase === true &&
      confirmations.noMisleadingAds === true &&
      confirmations.privacyRules === true &&
      confirmations.payoutPolicy === true;

    if (!allTrue) throw new CustomError("Please accept all terms first", 400);

    let profile = await AffiliateProfile.findOne({ userId });

    if (!profile) {
      const code = await genUniqueCode();
      profile = await AffiliateProfile.create({
        userId,
        status: "draft",
        code,
        commissionRate: DEFAULT_COMMISSION_RATE,
        joinedAt: new Date(),
      });
    }

    // ✅ עדכון שדות בצורה מפורשת (גם confirmations וגם meta)
    profile.terms.version = version;
    profile.terms.acceptedAt = new Date();
    profile.terms.acceptedIp = meta.ip ?? null;
    profile.terms.acceptedUserAgent = meta.userAgent ?? null;

    profile.terms.confirmations.programExplanation = true;
    profile.terms.confirmations.noSelfPurchase = true;
    profile.terms.confirmations.noMisleadingAds = true;
    profile.terms.confirmations.privacyRules = true;
    profile.terms.confirmations.payoutPolicy = true;

    await profile.save();
    return profile;
  }

  /**
   * שלב 2: הגשת בקשה (מועבר ל-pending) רק אחרי שהסכים לכל התנאים.
   */
  static async apply(userId) {
    if (!userId) throw new CustomError("Authorization required", 401);

    const profile = await AffiliateProfile.findOne({ userId });
    if (!profile) throw new CustomError("Please accept terms first", 400);

    if (!hasAcceptedAllTerms(profile)) {
      throw new CustomError("Please accept all terms first", 400);
    }

    // אם כבר במצב מתקדם - לא לייצר שוב
    if (profile.status === "pending" || profile.status === "approved")
      return profile;

    profile.status = "pending";
    await profile.save();
    return profile;
  }

  static async getMe(userId) {
    if (!userId) throw new CustomError("Authorization required", 401);
    return AffiliateProfile.findOne({ userId });
  }
  static async trackClick(payload, meta = {}) {
    const code = String(payload?.code || "")
      .trim()
      .toUpperCase();
    const path = String(payload?.path || "").trim();
    if (!code || !path) throw new CustomError("Invalid payload", 400);

    const aff = await AffiliateProfile.findOne({
      code,
      status: "approved",
    }).select("_id code");
    if (!aff) return { counted: false, unique: false };

    const ip = meta.ip || "";
    const ua = meta.userAgent || "";
    const ipHash = sha256(`${SALT}|ip|${ip}`);
    const uaHash = sha256(`${SALT}|ua|${ua}`);

    // rate limit בסיסי: 30 בדקה לאותו fingerprint
    const oneMinAgo = new Date(Date.now() - 60 * 1000);
    const spamCount = await AffiliateClick.countDocuments({
      code,
      ipHash,
      uaHash,
      createdAt: { $gte: oneMinAgo },
    });
    if (spamCount >= 30) throw new CustomError("Too many requests", 429);

    const day = getDayStr(new Date());

    const productId =
      payload?.productId && mongoose.isValidObjectId(payload.productId)
        ? new mongoose.Types.ObjectId(payload.productId)
        : null;

    await AffiliateClick.create({
      code,
      day,
      ipHash,
      uaHash,
      path,
      referrer: payload?.referrer ?? null,
      productId,
      meta: payload?.meta ?? null,
    });

    let unique = false;
    try {
      await AffiliateClickUnique.create({
        code,
        day,
        ipHash,
        uaHash,
        firstPath: path,
        firstReferrer: payload?.referrer ?? null,
        productId,
        firstSource: payload?.meta?.source ?? null,
      });
      unique = true;
    } catch (e) {
      unique = false; // duplicate key
    }

    return { counted: true, unique };
  }

  static async analyticsSummary(userId, query = {}) {
    if (!userId) throw new CustomError("Authorization required", 401);

    const profile = await AffiliateProfile.findOne({ userId }).select(
      "code status commissionRate"
    );
    if (!profile || profile.status !== "approved") {
      return {
        clicks: 0,
        uniqueClicks: 0,
        ordersCount: 0,
        paidOrdersCount: 0,
        paidAmount: 0,
        commissionRate: 0,
        estimatedCommissionPaid: 0,
      };
    }

    const code = profile.code;

    const from = query.from ? new Date(String(query.from)) : null;
    const to = query.to ? new Date(String(query.to)) : null;

    const dateMatch = {};
    if (from && !Number.isNaN(from.getTime())) dateMatch.$gte = from;
    if (to && !Number.isNaN(to.getTime())) dateMatch.$lte = to;

    const clickMatch = { code };
    if (Object.keys(dateMatch).length) clickMatch.createdAt = dateMatch;

    const clicks = await AffiliateClick.countDocuments(clickMatch);
    const uniqueMatch = { code };
    if (from || to) {
      // הופכים תאריכים ל-YYYY-MM-DD
      const fromDay = from ? getDayStr(from) : null;
      const toDay = to ? getDayStr(to) : null;

      uniqueMatch.day = {};
      if (fromDay) uniqueMatch.day.$gte = fromDay;
      if (toDay) uniqueMatch.day.$lte = toDay;
    }

    const uniqueClicks = await AffiliateClickUnique.countDocuments(uniqueMatch);
    const entries = await AffiliateClick.countDocuments({
      ...clickMatch,
      "meta.source": "entry",
    });

    const uniqueEntries = await AffiliateClickUnique.countDocuments({
      ...uniqueMatch,
      firstSource: "entry",
    });
    return {
      clicks,
      uniqueClicks,
      entries,
      uniqueEntries,
      commissionRate:
        typeof profile.commissionRate === "number" ? profile.commissionRate : 0,
      code,
    };
  }
static async analyticsTimeseries(userId, query = {}) {
  if (!userId) throw new CustomError("Authorization required", 401);

  const profile = await AffiliateProfile.findOne({ userId }).select("code status");
  if (!profile || profile.status !== "approved") return [];

  const code = profile.code;

  // תומכים ב:
  // ?fromDay=YYYY-MM-DD&toDay=YYYY-MM-DD
  // וגם ?days=30 (ברירת מחדל 14)
  const qFromDay = parseDayStr(query.fromDay);
  const qToDay = parseDayStr(query.toDay);
  const days = Math.max(1, Math.min(365, Number(query.days || 14)));

  let toDay = qToDay || getDayStrLocal(new Date());
  let fromDay = qFromDay || addDays(toDay, -(days - 1));

  // אם המשתמש שלח fromDay/toDay הפוכים - נסדר בלי להפיל
  if (fromDay > toDay) {
    const tmp = fromDay;
    fromDay = toDay;
    toDay = tmp;
  }

  // 1) clicks grouped by day
  const clicksAgg = await AffiliateClick.aggregate([
    { $match: { code, day: { $gte: fromDay, $lte: toDay } } },
    { $group: { _id: "$day", clicks: { $sum: 1 } } },
    { $project: { _id: 0, day: "$_id", clicks: 1 } },
    { $sort: { day: 1 } },
  ]);

  // 2) unique grouped by day
  const uniqueAgg = await AffiliateClickUnique.aggregate([
    { $match: { code, day: { $gte: fromDay, $lte: toDay } } },
    { $group: { _id: "$day", unique: { $sum: 1 } } },
    { $project: { _id: 0, day: "$_id", unique: 1 } },
    { $sort: { day: 1 } },
  ]);

  // 3) merge + fill missing days
  const map = new Map();

  for (const r of clicksAgg) {
    map.set(r.day, { day: r.day, clicks: r.clicks || 0, unique: 0 });
  }
  for (const r of uniqueAgg) {
    const existing = map.get(r.day) || { day: r.day, clicks: 0, unique: 0 };
    existing.unique = r.unique || 0;
    map.set(r.day, existing);
  }

  const daysList = buildDayRange(fromDay, toDay);
  return daysList.map((day) => map.get(day) || { day, clicks: 0, unique: 0 });
}

  // אופציונלי: לאדמין (אפשר להוסיף בהמשך)
  // static async adminApprove(userId, rate) { ... }
}
