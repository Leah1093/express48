import { Store } from "../models/store.js";
import { StoreSlugAlias } from "../models/storeSlugAlias.js";


export async function storeSlugRedirect(req, res, next) {
  try {
    const { slug } = req.params;

    // יש חנות עם ה-slug? ממשיכים.
    const store = await Store.findOne({ slug, status: "active" }).select("_id").lean();
    if (store) return next();

    // אין חנות — בדוק Alias
    const alias = await StoreSlugAlias.findOne({ fromSlug: slug, active: true }).lean();
    if (alias?.toSlug) {
      const target = `/stores/${alias.toSlug}`;
      return res.redirect(301, target);
    }

    // לא נמצא כלום
    return next();
  } catch (e) {
    return next(e);
  }
}
