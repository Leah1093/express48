import { Product } from "../models/product.js";

const esc = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const baseVisibility = (storeId, strict) =>
  strict
    ? { isDeleted: false, status: "published", visibility: "public", ...(storeId ? { storeId } : {}) }
    : { isDeleted: { $ne: true }, ...(storeId ? { storeId } : {}) };

const buildOr = (term) => {
  const rx = new RegExp(esc(term), "i");
  const rxHeb = new RegExp(esc(term.toLowerCase()), "i");
  return [
    { title: rx }, { name: rx }, { brand: rx }, { model: rx }, { sku: rx },
    { aliases: rx }, { "categories.name": rx },
    { title_he_plain: rxHeb }, { brand_he_plain: rxHeb }, { model_he_plain: rxHeb }, { description_he_plain: rxHeb },
  ];
};



class SearchService {
  async suggest({ q, limit = 8, storeId, strict = false }) {
    const term = (q || "").trim();
    if (!term) return [];
    const rxPrefix = new RegExp("^" + esc(term), "i");
    const rxHeb = new RegExp("^" + esc(term.toLowerCase()), "i");

    const docs = await Product.find(
      {
        ...baseVisibility(storeId, strict),
        $or: [
          { title: rxPrefix }, { name: rxPrefix }, { brand: rxPrefix }, { model: rxPrefix }, { sku: rxPrefix },
          { aliases: rxPrefix }, { "categories.name": rxPrefix },
          { title_he_plain: rxHeb }, { brand_he_plain: rxHeb }, { model_he_plain: rxHeb },
        ],
      },
      { _id: 0, title: 1, name: 1, title_he_plain: 1 }
    ).limit(Math.min(limit, 12)).lean();

    const set = new Set();
    for (const d of docs) set.add(d.title || d.name || d.title_he_plain);
    return Array.from(set).slice(0, limit);
  }

  async quick({ q, limit = 4, storeId, strict = false }) {
    const term = (q || "").trim();
    if (!term) return [];
    const filter = { ...baseVisibility(storeId, strict), $or: buildOr(term) };

    const rows = await Product.find(
      filter,
      { title: 1, name: 1, slug: 1, price: 1, image: 1, images: 1, updatedAt: 1 }
    )
      .sort({ updatedAt: -1 })
      .limit(Math.min(limit, 8))
      .lean();

    return rows.map((p) => ({
      name: p.title || p.name,
      slug: p.slug,
      price: p?.price?.amount ?? p?.price ?? 0,
      image: p.image || (Array.isArray(p.images) ? p.images[0] : ""),
    }));
  }

  async combinedSearch({ q, quickLimit = 4, storeId, strict = false }) {
    const [suggestions, quickItems] = await Promise.all([
      this.suggest({ q,  storeId, strict }),
      this.quick({ q, limit: quickLimit, storeId, strict }),
    ]);
    return { suggestions, quickItems };
  }

  async results({ q, page = 1, limit = 24, storeId, strict = false }) {
    const term = (q || "").trim();
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit) || 24, 1), 60);
    if (!term) return { items: [], page: pageNum, total: 0, pages: 0 };

    const filter = { ...baseVisibility(storeId, strict), $or: buildOr(term) };

    const [rows, total] = await Promise.all([
      Product.find(filter, { title: 1, name: 1, slug: 1, price: 1, image: 1, images: 1, updatedAt: 1 })
        .sort({ updatedAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const items = rows.map((p) => ({
      name: p.title || p.name,
      slug: p.slug,
      price: p?.price?.amount ?? p?.price ?? 0,
      image: p.image || (Array.isArray(p.images) ? p.images[0] : ""),
    }));

    return { items, page: pageNum, total, pages: Math.ceil(total / pageSize) };
  }
}

export const searchService = new SearchService();
