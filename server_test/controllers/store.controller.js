import StoreService from "../service/store.service.js";
const storeService = new StoreService();

export default class StoreController {
    async getMyStore(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });
            const store = await storeService.getByUserId(userId);
            if (!store) return res.json(null);
            res.json(store);
        } catch (err) { next(err); }
    }

    async saveMyStore(req, res, next) {
        try {
            const userId = req.user?.userId;
            const sellerId = req.user?.sellerId;
            if (!userId || !sellerId) return res.status(401).json({ message: "Unauthorized" });

            const actor = { userId, role: req.user?.role };
            const clean = { ...req.body };
            ["slug", "slugChanged", "status"].forEach(f => delete clean[f]); // לא דרך המסלול הזה

            let store = await storeService.getByUserId(userId);
            if (!store) store = await storeService.create(userId, sellerId, clean, actor);
            else store = await storeService.update(store, clean, actor);

            res.json(store);
        } catch (err) { next(err); }
    }


    async uploadAllMedia(req, res, next) {
        const newUrls = req.processedMedia?._newUrls || [];
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const store = await storeService.getByUserId(userId);
            if (!store) return res.status(404).json({ message: "Store not found. Save basic info first." });

            const { logo, storeBanner, mobileBanner, listBanner, slider, bannerTypeStore, bannerTypeList, replaceSlider } = req.processedMedia;

            const updated = await storeService.updateMediaAtomic(
                store,
                { logo, storeBanner, mobileBanner, listBanner, slider, bannerTypeStore, bannerTypeList, replaceSlider },
                { removeOldBinaries: true }
            );

            return res.json({ ok: true, store: updated });
        } catch (err) {
            try {
                const pathMod = await import("path");
                const fs = await import("fs/promises");
                for (const u of newUrls) {
                    if (!u?.startsWith?.("/uploads/")) continue;
                    const filename = u.replace("/uploads/", "");
                    const abs = pathMod.default.join(process.cwd(), "uploads", filename);
                    await fs.default.unlink(abs).catch(() => { });
                }
            } catch { }
            next(err);
        }
    }

    async updateMySlug(req, res, next) {
        try {
            console.log("👌👍")

            const actor = { userId: req.user?.userId, role: req.user?.role };
            const desiredSlug = (req.body?.slug || "").trim();
            if (!desiredSlug) return res.status(400).json({ error: "חסר slug" });
            console.log("👌👍", desiredSlug)

            const result = await storeService.updateSlugByActor({ actor, scope: "me", desiredSlug, });
            res.json({ success: true, slug: result.slug });
        } catch (err) {
            next(err);
        }
    }

    async adminUpdateSlug(req, res, next) {
        try {
            const actor = { userId: req.user?.userId, role: req.user?.role };
            const { id } = req.params;
            const requestedSlug = req.body?.slug; // חובה לעדכון ידני
            const { slug } = await storeService.updateSlugByActor({ actor, scope: "admin", storeId: id, requestedSlug });
            res.json({ success: true, slug });
        } catch (err) { next(err); }

    }

    // controllers/store.controller.js (קטעים רלוונטיים)
    async updateMyStatus(req, res, next) {
        try {
            console.log("updateMyStatus")
            const actor = { userId: req.user?.userId, role: req.user?.role };
            const { status } = req.body; // מאומת ע"י Zod
            console.log("status",status)

            const store = await storeService.updateStatusByActor({ actor, scope: "me", status });
            res.json(store);
        } catch (err) { next(err); }
    }

    async adminUpdateStoreStatus(req, res, next) {
        try {
            const actor = { userId: req.user?.userId, role: req.user?.role };
            const { id } = req.params;          // מאומת ע"י idParamsSchema
            const { status, note } = req.body;  // מאומת ע"י Zod
            const store = await storeService.updateStatusByActor({ actor, scope: "admin", storeId: id, status, note });
            res.json(store);
        } catch (err) { next(err); }
    }
}
