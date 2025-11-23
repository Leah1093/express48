import { StorePublicService } from "../services/storePublic.service.js";

export class StorePublicController {
  constructor() {
    this.service = new StorePublicService();
    this.getPublicStore = this.getPublicStore.bind(this);
  }

  async getPublicStore(req, res, next) {
    try {
      const { slug } = req.params;

      const requester = {
        userId: req.user?.userId || null,
        role: req.user?.role || "guest",
        roles: req.user?.roles || [],
        sellerId: req.user?.sellerId || null,
      };

      const data = await this.service.getPublicStore({ slug, requester });

      if (data.visibility === "public") {
        res.set("Cache-Control", "public, max-age=60");
      } else {
        res.set("Cache-Control", "no-store");
      }
      res.set("Vary", "Authorization, Cookie");
      return res.json({ ok: true, store: data });
    } catch (err) {
      next(err);
    }
  }
}
