// // controllers/storePublic.controller.js
// import { StorePublicService } from "../service/storePublic.service.js";
// export class StorePublicController {
//   async getBySlug(req, res, next) {
//     try {
//       const { slug } = req.params;
//       const store = await StorePublicService.getBySlug(slug);
//       if (!store) return res.status(404).json({ message: "Store not found" });
//       res.json(store);
//     } catch (err) { next(err); }
//   }

//   async listProducts(req, res, next) {
//     try {
//       const { slug } = req.params;
//       const page  = Math.max(1, parseInt(req.query.page) || 1);
//       const limit = Math.min(100, parseInt(req.query.limit) || 24);

//       const result = await StorePublicService.listProducts({ slug, page, limit });
//       if (!result) return res.status(404).json({ message: "Store not found" });
//       res.json(result);
//     } catch (err) { next(err); }
//   }

//   async listReviews(req, res, next) {
//     try {
//       const { slug } = req.params;
//       const page  = Math.max(1, parseInt(req.query.page) || 1);
//       const limit = Math.min(100, parseInt(req.query.limit) || 20);

//       const result = await StorePublicService.listReviews({ slug, page, limit });
//       if (!result) return res.status(404).json({ message: "Store not found" });
//       res.json(result);
//     } catch (err) { next(err); }
//   }
// }




import { StorePublicService } from "../service/storePublic.service.js";

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
