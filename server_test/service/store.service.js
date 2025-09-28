import path from "path";
import fs from "fs/promises";
import httpError from "http-errors";
import { Store } from "../models/store.js";
import { normalizeUserSlug } from "../utils/slugify.js";
export default class StoreService {
    async getByUserId(userId) { return Store.findOne({ userId }); }
    async getBySellerId(sellerId) { return Store.findOne({ sellerId }); }
    async getById(id) { return Store.findById(id); }

    async create(userId, sellerId, payload) {
        const exists = await Store.findOne({ $or: [{ userId }, { sellerId }] });
        if (exists) return exists;
        return Store.create({ ...payload, userId, sellerId });
    }

    // async update(store, payload) { Object.assign(store, payload); return store.save(); }

    async update(store, payload, actor) {
        const clean = { ...payload };
        ["slug", "slugChanged", "status"].forEach(f => delete clean[f]); // מוגנים

        Object.assign(store, clean);
        store.lastAction = { by: actor?.userId, role: actor?.role, at: new Date(), action: "update-store" };
        return store.save();
    }
    _media(kind, url, alt = "") { return { kind, url, alt }; }

    async _safeUnlinkIfLocal(oldUrl) {
        try {
            if (!oldUrl?.startsWith?.("/uploads/")) return;
            const filename = oldUrl.replace("/uploads/", "");
            const abs = path.join(process.cwd(), "uploads", filename);
            await fs.unlink(abs).catch(() => { });
        } catch { }
    }

    async updateMediaAtomic(store, payload, options = {}) {
        const {
            logo, storeBanner, mobileBanner, listBanner,
            slider = [], bannerTypeStore = "static", bannerTypeList = "static",
            replaceSlider = false,
        } = payload;

        const { removeOldBinaries = true } = options;

        const old = {
            logo: store?.logo?.url,
            storeBanner: store?.storeBanner?.url,
            mobileBanner: store?.mobileBanner?.url,
            listBanner: store?.listBanner?.url,
            slider: (store?.storeSlider || []).map(m => m.url),
        };

        if (logo?.url && logo?.kind) {
            if (removeOldBinaries && store?.logo?.url && store.logo.url !== logo.url) {
                await this._safeUnlinkIfLocal(store.logo.url);
            }
            store.logo = this._media(logo.kind, logo.url, "");
        }

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
            store.bannerTypeStore = bannerTypeStore; // "static" | "video"
            if (storeBanner?.url && storeBanner?.kind) {
                if (removeOldBinaries && store?.storeBanner?.url && store.storeBanner.url !== storeBanner.url) {
                    await this._safeUnlinkIfLocal(store.storeBanner.url);
                }
                store.storeBanner = this._media(storeBanner.kind, storeBanner.url, "");
            }
        }

        if (mobileBanner?.url && mobileBanner?.kind) {
            if (removeOldBinaries && store?.mobileBanner?.url && store.mobileBanner.url !== mobileBanner.url) {
                await this._safeUnlinkIfLocal(store.mobileBanner.url);
            }
            store.mobileBanner = this._media(mobileBanner.kind, mobileBanner.url, "");
        }

        store.bannerTypeList = bannerTypeList;
        if (listBanner?.url && listBanner?.kind) {
            if (removeOldBinaries && store?.listBanner?.url && store.listBanner.url !== listBanner.url) {
                await this._safeUnlinkIfLocal(store.listBanner.url);
            }
            store.listBanner = this._media(listBanner.kind, listBanner.url, "");
        }

        return store.save();
    }

    // --- סלוג ---




    async updateSlugByActor({ actor, scope, storeId, desiredSlug }) {
        const isAdmin = actor?.role === "admin";
        let store;

        if (scope === "me") {
            if (!actor?.userId) throw httpError(401, "Unauthorized");
            store = await this.getByUserId(actor.userId);
        } else if (scope === "admin") {
            if (!isAdmin) throw httpError(403, "Forbidden");
            store = await this.getById(storeId);
        } else throw httpError(400, "Bad scope");
        console.log("store", store.status)
        console.log("isAdmin", store.slugChanged)
        if (!store) throw httpError(404, "Store לא נמצאה");

        if (!isAdmin) {
            if (store.status !== "draft") throw httpError(400, "אפשר לשנות סלוג רק בטיוטה");
            if (store.slugChanged) throw httpError(400, "אפשר לשנות סלוג פעם אחת בלבד");
        }

        if (!desiredSlug) throw httpError(400, "חסר slug");
        const base = normalizeUserSlug(desiredSlug);       // ← אנגלית בלבד
        console.log("desiredSlug", desiredSlug)

        const unique = await this._uniqueSlug(base, store._id);

        console.log("base", base)
        console.log("unique", unique)
        store.slug = unique;
        if (!isAdmin) store.slugChanged = true;
        store.lastAction = { by: actor.userId, role: actor.role, at: new Date(), action: "update-slug" };
        await store.save();

        return { slug: store.slug };
    }

    // הבטחת ייחודיות
    async _uniqueSlug(base, ignoreId) {
        let candidate = base;
        let i = 2;
        while (await Store.exists({ slug: candidate, _id: { $ne: ignoreId } })) {
            candidate = `${base}-${i++}`;
        }
        return candidate;
    }

    // שינוי סטטוס עם כללי הרשאה
    async updateStatusByActor({ actor, scope, storeId, status, note }) {
        const ALLOWED = ["draft", "active", "suspended"];
        const isAdmin = actor?.role === "admin";
        const desired = String(status || "").trim().toLowerCase();
        if (!ALLOWED.includes(desired)) throw httpError(400, "סטטוס לא תקין");

        let store;
        if (scope === "me") {
            if (!actor?.userId) throw httpError(401, "Unauthorized");
            store = await this.getByUserId(actor.userId);
            if (!store) throw httpError(404, "Store לא נמצאה");

            // מוכר: מותר רק לפרסם מטיוטה (draft -> active)
            if (!(store.status === "draft" && desired === "active")) {
                throw httpError(400, "מוכר יכול לפרסם רק מטיוטה");
            }
        } else if (scope === "admin") {
            if (!isAdmin) throw httpError(403, "Forbidden");
            store = await this.getById(storeId);
            if (!store) throw httpError(404, "Store לא נמצאה");
            // לאדמין מותר לכל אחד מהמצבים המותרים
        } else {
            throw httpError(400, "Bad scope");
        }

        store.status = desired;
        store.lastAction = {
            by: actor.userId,
            role: actor.role,
            at: new Date(),
            action: "update-status",
            note: note || ""
        };

        await store.save();
        return store;
    }
}
