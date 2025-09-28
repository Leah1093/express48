import httpError from "http-errors";
import { Store } from "../models/store.js";
import { Seller } from "../models/seller.js";

function isAdmin(requester) {
  return requester?.role === "admin" || (requester?.roles || []).includes("admin");
}
function isSeller(requester) {
  return requester?.role === "seller" || (requester?.roles || []).includes("seller");
}

export class StorePublicService {
  async getPublicStore({ slug, requester }) {
    const store = await Store.findOne({ slug })
      .select({
        _id: 1,
        sellerId: 1,
        userId: 1,
        name: 1,
        slug: 1,
        status: 1,
        contactEmail: 1,
        phone: 1,
        support: 1,
        logo: 1,
        bannerTypeStore: 1,
        storeBanner: 1,
        mobileBanner: 1,
        storeSlider: 1,
        bannerTypeList: 1,
        listBanner: 1,
        description: 1,
        appearance: 1,
        publishedAt: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean();

    if (!store) throw httpError(404, "Store not found");

    const published = store.status === "active";

    // בעלות ישירה (יוזר או סלר שמחובר ישירות)
    const ownerByUser = requester?.userId && store.userId?.toString?.() === requester.userId;
    const ownerBySeller = requester?.sellerId && store.sellerId?.toString?.() === requester.sellerId;
    const owner = ownerByUser || ownerBySeller;

    const admin = isAdmin(requester);
    const seller = isSeller(requester);

    // תנאי גישה
    if (!published && !(owner || admin || seller)) {
      throw httpError(403, "Store not published");
    }

    // דירוגים ממודל Seller
    let rating = { avg: 0, count: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    if (store.sellerId) {
      const s = await Seller.findById(store.sellerId).select({ ratings: 1 }).lean();
      if (s?.ratings) {
        rating = {
          avg: Number(s.ratings.avg || 0),
          count: Number(s.ratings.count || 0),
          breakdown: {
            1: Number(s.ratings.breakdown?.[1] || 0),
            2: Number(s.ratings.breakdown?.[2] || 0),
            3: Number(s.ratings.breakdown?.[3] || 0),
            4: Number(s.ratings.breakdown?.[4] || 0),
            5: Number(s.ratings.breakdown?.[5] || 0),
          },
        };
      }
    }

    const visibility = published ? "public" : "preview";
    return {
      id: store._id,
      visibility,   // "public" | "preview" – נוח ל-UI
      status: store.status,
      name: store.name,
      slug: store.slug,
      description: store.description || "",
      contactEmail: store.contactEmail,
      phone: store.phone || "",
      support: store.support || {
        email: "", phone: "", whatsapp: "", hours: "", note: ""
      },
      branding: {
        logo: store.logo || null,
        bannerTypeStore: store.bannerTypeStore,
        storeBanner: store.storeBanner || null,
        mobileBanner: store.mobileBanner || null,
        storeSlider: store.storeSlider || [],
        bannerTypeList: store.bannerTypeList,
        listBanner: store.listBanner || null,
      },
      appearance: store.appearance || {
        storeNamePosition: "header",
        productsPerPage: 24,
        hideEmail: false,
        hidePhone: false,
        hideAddress: false,
        hideAbout: false,
      },
      publishedAt: store.publishedAt || null,
      rating,
      timestamps: {
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      },
    };
  }
}
