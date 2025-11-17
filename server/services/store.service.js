import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { Store } from "../models/store.js";
import { normalizeUserSlug } from "../utils/slugify.js";
import { CustomError } from "../utils/CustomError.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class StoreService {
  // נקודת זמן ניתנת למוקינג בטסטים
  now() { return new Date(); }

  // --- Queries ---
  async getByUserId(userId) { return Store.findOne({ userId }); }
  async getBySellerId(sellerId) { return Store.findOne({ sellerId }); }
  async getById(id) { return Store.findById(id); }

  // --- Create ---
  async create(userId, sellerId, payload) {
    const exists = await Store.findOne({ $or: [{ userId }, { sellerId }] });
    if (exists) return exists;
    const doc = await Store.create({ ...payload, userId, sellerId });
    return doc;
  }

  // --- Update (allowlist) ---
  async update(store, payload, actor) {
    if (!store) throw new CustomError("Store לא נמצאה", 404);

    // allowlist בלבד
    const allowed = [
      "name", "description", "contactEmail", "contactPhone",
      "address", "social", "seo", "theme", "settings",
      "logo", "storeBanner", "mobileBanner", "listBanner",
      "bannerTypeStore", "bannerTypeList", "storeSlider"
    ];
    const clean = {};
    for (const k of allowed) if (k in payload) clean[k] = payload[k];

    Object.assign(store, clean);
    store.lastAction = { by: actor?.userId || null, role: actor?.role || null, at: this.now(), action: "update-store" };
    await store.save();
    return store;
  }

  _media(kind, url, alt = "") { return { kind, url, alt }; }

  // מחיקה בטוחה של קובץ לוקאלי
  async _safeUnlinkIfLocal(oldUrl) {
    try {
      if (!oldUrl?.startsWith?.("/uploads/")) return;
      const filename = oldUrl.slice("/uploads/".length);
      const uploadsDir = path.resolve(process.cwd(), "uploads");
      const abs = path.resolve(uploadsDir, filename);
      // ווידוא שהקובץ באמת בתוך uploads
      if (!abs.startsWith(uploadsDir)) return;
      await fs.unlink(abs).catch(() => {});
    } catch {
      // שקט מכוון
    }
  }

  // --- מדיה: עדכון אטומי עם אפשרות החלפה ---
  async updateMediaAtomic(store, payload, options = {}) {
    if (!store) throw new CustomError("Store לא נמצאה", 404);

    const {
      logo, storeBanner, mobileBanner, listBanner,
      slider = [],
      bannerTypeStore = "static",
      bannerTypeList = "static",
      replaceSlider = false,
    } = payload ?? {};

    const { removeOldBinaries = true } = options;

    // ודא מערך קיים
    if (!Array.isArray(store.storeSlider)) store.storeSlider = [];

    const old = {
      logo: store?.logo?.url,
      storeBanner: store?.storeBanner?.url,
      mobileBanner: store?.mobileBanner?.url,
      listBanner: store?.listBanner?.url,
      slider: (store?.storeSlider || []).map(m => m.url),
    };

    // logo
    if (logo?.url && logo?.kind) {
      if (removeOldBinaries && old.logo && old.logo !== logo.url) {
        await this._safeUnlinkIfLocal(old.logo);
      }
      store.logo = this._media(logo.kind, logo.url, "");
    }

    // store banner or slider
    if (bannerTypeStore === "slider") {
      store.bannerTypeStore = "slider";
      store.storeBanner = undefined;

      if (replaceSlider) {
        if (removeOldBinaries) {
          for (const u of old.slider) await this._safeUnlinkIfLocal(u);
        }
        store.storeSlider = slider.map(u => this._media("image", u, ""));
      } else if (slider.length) {
        store.storeSlider.push(...slider.map(u => this._media("image", u, "")));
      }
    } else {
      // "static" | "video"
      store.bannerTypeStore = bannerTypeStore;
      if (storeBanner?.url && storeBanner?.kind) {
        if (removeOldBinaries && old.storeBanner && old.storeBanner !== storeBanner.url) {
          await this._safeUnlinkIfLocal(old.storeBanner);
        }
        store.storeBanner = this._media(storeBanner.kind, storeBanner.url, "");
      }
    }

    // mobile banner
    if (mobileBanner?.url && mobileBanner?.kind) {
      if (removeOldBinaries && old.mobileBanner && old.mobileBanner !== mobileBanner.url) {
        await this._safeUnlinkIfLocal(old.mobileBanner);
      }
      store.mobileBanner = this._media(mobileBanner.kind, mobileBanner.url, "");
    }

    // list banner
    store.bannerTypeList = bannerTypeList;
    if (listBanner?.url && listBanner?.kind) {
      if (removeOldBinaries && old.listBanner && old.listBanner !== listBanner.url) {
        await this._safeUnlinkIfLocal(old.listBanner);
      }
      store.listBanner = this._media(listBanner.kind, listBanner.url, "");
    }

    await store.save();
    return store;
  }

  // --- Slug ---

  async updateSlugByActor({ actor, scope, storeId, desiredSlug }) {
    const isAdmin = actor?.role === "admin";
    let store;

    if (scope === "me") {
      if (!actor?.userId) throw new CustomError("Authorization required", 401);
      store = await this.getByUserId(actor.userId);
    } else if (scope === "admin") {
      if (!isAdmin) throw new CustomError("Forbidden", 403);
      store = await this.getById(storeId);
    } else {
      throw new CustomError("Bad scope", 400);
    }

    if (!store) throw new CustomError("Store לא נמצאה", 404);

    if (!isAdmin) {
      if (store.status !== "draft") throw new CustomError("אפשר לשנות סלוג רק בטיוטה", 400);
      if (store.slugChanged) throw new CustomError("אפשר לשנות סלוג פעם אחת בלבד", 400);
    }

    const raw = String(desiredSlug ?? "").trim();
    if (!raw) throw new CustomError("חסר slug", 400);

    const base = normalizeUserSlug(raw);
    if (!base) throw new CustomError("slug לא תקין", 400);

    const unique = await this._uniqueSlug(base, store._id);

    store.slug = unique;
    if (!isAdmin) store.slugChanged = true;
    store.lastAction = { by: actor.userId, role: actor.role, at: this.now(), action: "update-slug" };
    await store.save();

    return { slug: store.slug };
  }

  // ייחודיות סלוג
  async _uniqueSlug(base, ignoreId) {
    let candidate = base;
    let i = 2;
    // בדיקת קיום עד למציאת ייחודי
    // ניתן לשקול collation במודל לשוויון case-insensitive אם צריך
    // { collation: { locale: "en", strength: 2 } }
    // אבל כאן נשאר לוגיקה פשוטה
    // eslint-disable-next-line no-constant-condition
    while (await Store.exists({ slug: candidate, _id: { $ne: ignoreId } })) {
      candidate = `${base}-${i++}`;
    }
    return candidate;
  }

  // --- Status ---

  async updateStatusByActor({ actor, scope, storeId, status, note }) {
    const ALLOWED = ["draft", "active", "suspended"];
    const isAdmin = actor?.role === "admin";
    const desired = String(status || "").trim().toLowerCase();
    if (!ALLOWED.includes(desired)) throw new CustomError("סטטוס לא תקין", 400);

    let store;
    if (scope === "me") {
      if (!actor?.userId) throw new CustomError("Authorization required", 401);
      store = await this.getByUserId(actor.userId);
      if (!store) throw new CustomError("Store לא נמצאה", 404);
      // מוכר: רק פרסום מטיוטה
      if (!(store.status === "draft" && desired === "active")) {
        throw new CustomError("מוכר יכול לפרסם רק מטיוטה", 400);
      }
    } else if (scope === "admin") {
      if (!isAdmin) throw new CustomError("Forbidden", 403);
      store = await this.getById(storeId);
      if (!store) throw new CustomError("Store לא נמצאה", 404);
      // לאדמין מותר לכל אחד מהמצבים המותרים
    } else {
      throw new CustomError("Bad scope", 400);
    }

    store.status = desired;
    store.lastAction = {
      by: actor.userId,
      role: actor.role,
      at: this.now(),
      action: "update-status",
      note: note || ""
    };

    await store.save();
    return store;
  }
}
