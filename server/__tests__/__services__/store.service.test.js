// __tests__/__services__/store.service.test.js
// ---- נתיבי ייבוא לפי מה שציינת ----
const SERVICE_PATH  = "../../service/store.service.js";
const STORE_SPEC    = "../../models/store.js";
const SLUGIFY_SPEC  = "../../utils/slugify.js";
// -------------------------------------

import { jest } from "@jest/globals";
import nodePath from "path";

// --- Mocks: Store ---
const StoreMock = {
  findOne : jest.fn(),
  findById: jest.fn(),
  create  : jest.fn(),
  exists  : jest.fn(),
};
jest.unstable_mockModule(STORE_SPEC, () => ({
  Store: StoreMock,
}));

// --- Mocks: slugify.normalizeUserSlug ---
const normalizeUserSlug = jest.fn((s) =>
  String(s ?? "").trim().toLowerCase().replace(/\s+/g, "-")
);
jest.unstable_mockModule(SLUGIFY_SPEC, () => ({
  normalizeUserSlug,
}));

// --- Mocks: fs/promises (כולל default + unlink) ---
const unlink = jest.fn().mockResolvedValue();
jest.unstable_mockModule("fs/promises", () => ({
  default: { unlink },
  unlink,
}));
// (אופציונלי לסביבות מסוימות)
// jest.unstable_mockModule("node:fs/promises", () => ({
//   default: { unlink },
//   unlink,
// }));

// טוענים את הסרוויס אחרי שהוגדרו כל ה-mocks
const { default: StoreService } = await import(SERVICE_PATH);

describe("StoreService - full coverage (lines & branches)", () => {
  let svc;

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    svc = new StoreService();
  });

  // ---------- getBy* ----------

  test("getByUserId - success", async () => {
    const doc = { _id: "S1" };
    StoreMock.findOne.mockResolvedValueOnce(doc);
    await expect(svc.getByUserId("U1")).resolves.toBe(doc);
    expect(StoreMock.findOne).toHaveBeenCalledWith({ userId: "U1" });
  });

  test("getByUserId - DB error bubbles", async () => {
    StoreMock.findOne.mockRejectedValueOnce(new Error("DB"));
    await expect(svc.getByUserId("U1")).rejects.toThrow("DB");
  });

  test("getBySellerId - success", async () => {
    const doc = { _id: "S2" };
    StoreMock.findOne.mockResolvedValueOnce(doc);
    await expect(svc.getBySellerId("SEL1")).resolves.toBe(doc);
    expect(StoreMock.findOne).toHaveBeenCalledWith({ sellerId: "SEL1" });
  });

  test("getBySellerId - DB error bubbles", async () => {
    StoreMock.findOne.mockRejectedValueOnce(new Error("DB-seller"));
    await expect(svc.getBySellerId("SELX")).rejects.toThrow("DB-seller");
  });

  test("getById - success & error", async () => {
    const doc = { _id: "S3" };
    StoreMock.findById.mockResolvedValueOnce(doc);
    await expect(svc.getById("S3")).resolves.toBe(doc);
    expect(StoreMock.findById).toHaveBeenCalledWith("S3");

    StoreMock.findById.mockRejectedValueOnce(new Error("DB2"));
    await expect(svc.getById("S4")).rejects.toThrow("DB2");
  });

  // ---------- create ----------

  test("create - returns existing if found", async () => {
    const existing = { _id: "S1", userId: "U1" };
    StoreMock.findOne.mockResolvedValueOnce(existing);
    const res = await svc.create("U1", "SEL1", { name: "n" });
    expect(res).toBe(existing);
    expect(StoreMock.create).not.toHaveBeenCalled();
  });

  test("create - creates when not exists; create error bubbles", async () => {
    StoreMock.findOne.mockResolvedValueOnce(null);
    const created = { _id: "SNEW", userId: "U1", sellerId: "SEL1", name: "n" };
    StoreMock.create.mockResolvedValueOnce(created);

    const res = await svc.create("U1", "SEL1", { name: "n" });
    expect(StoreMock.create).toHaveBeenCalledWith({ name: "n", userId: "U1", sellerId: "SEL1" });
    expect(res).toBe(created);

    StoreMock.findOne.mockResolvedValueOnce(null);
    StoreMock.create.mockRejectedValueOnce(new Error("DB create"));
    await expect(svc.create("U2", "SEL2", { name: "x" })).rejects.toThrow("DB create");
  });

  test("create - findOne throws -> bubbles", async () => {
    StoreMock.findOne.mockRejectedValueOnce(new Error("DB findOne"));
    await expect(svc.create("U3", "SEL3", { name: "y" })).rejects.toThrow("DB findOne");
  });

  // ---------- update ----------

  test("update - ignores protected fields; saves; sets lastAction (actor provided)", async () => {
    const store = {
      slug: "orig-slug",
      slugChanged: false,
      status: "draft",
      name: "Old",
      save: jest.fn().mockResolvedValue(),
    };

    const payload = {
      slug: "should-not-change",
      slugChanged: true,
      status: "active",
      name: "New",
      contactEmail: "a@b.com",
      extra_field: "ignored-by-allowlist",
    };

    const actor = { userId: "U1", role: "seller" };
    const res = await svc.update(store, payload, actor);

    expect(res).toBe(store);
    expect(store.slug).toBe("orig-slug");
    expect(store.slugChanged).toBe(false);
    expect(store.status).toBe("draft");
    expect(store.name).toBe("New");
    expect(store.contactEmail).toBe("a@b.com");
    expect(store.extra_field).toBeUndefined();
    expect(store.lastAction).toMatchObject({
      by: "U1",
      role: "seller",
      action: "update-store",
    });
    expect(store.save).toHaveBeenCalled();
  });

  test("update - actor undefined → lastAction.by/role are null (|| null branch)", async () => {
    const store = { save: jest.fn().mockResolvedValue() };
    const res = await svc.update(store, { name: "X" });
    expect(res).toBe(store);
    expect(store.lastAction).toMatchObject({
      by: null,
      role: null,
      action: "update-store",
    });
    expect(store.save).toHaveBeenCalled();
  });

  test("update - store is null -> 404", async () => {
    await expect(svc.update(null, { name: "X" }, { userId: "U1", role: "seller" }))
      .rejects.toMatchObject({ status: 404 });
  });

  // ---------- _media ----------

  test("_media returns normalized object", () => {
    const m = svc._media("image", "/u/p.jpg", "alt");
    expect(m).toEqual({ kind: "image", url: "/u/p.jpg", alt: "alt" });
  });

  // ---------- _safeUnlinkIfLocal ----------

  test("_safeUnlinkIfLocal - skips non-/uploads/ urls", async () => {
    await svc._safeUnlinkIfLocal("/other/xx.jpg");
    expect(unlink).not.toHaveBeenCalled();
  });

  test("_safeUnlinkIfLocal - prevents path traversal outside uploads", async () => {
    unlink.mockClear();
    await svc._safeUnlinkIfLocal("/uploads/../../evil.txt");
    expect(unlink).not.toHaveBeenCalled();
  });

  test("_safeUnlinkIfLocal - unlinks inside uploads; ignores unlink errors", async () => {
    const url = "/uploads/a/b/c.jpg";
    const expected = nodePath.join(process.cwd(), "uploads", "a/b/c.jpg");
    await svc._safeUnlinkIfLocal(url);
    expect(unlink).toHaveBeenCalledWith(expected);

    unlink.mockRejectedValueOnce(new Error("no-file"));
    await expect(svc._safeUnlinkIfLocal("/uploads/miss.jpg")).resolves.toBeUndefined();
  });

  // ---------- updateMediaAtomic ----------

  test("updateMediaAtomic - no store -> 404", async () => {
    await expect(svc.updateMediaAtomic(null, {})).rejects.toMatchObject({ status: 404 });
  });

  test("updateMediaAtomic - initializes storeSlider when missing, then append", async () => {
    const store = { save: jest.fn().mockResolvedValue() }; // אין storeSlider
    await svc.updateMediaAtomic(
      store,
      { bannerTypeStore: "slider", slider: ["/uploads/one.jpg"], replaceSlider: false }
    );
    expect(Array.isArray(store.storeSlider)).toBe(true);
    expect(store.storeSlider.map(x => x.url)).toEqual(["/uploads/one.jpg"]);
    expect(store.bannerTypeStore).toBe("slider");
    expect(store.save).toHaveBeenCalled();
  });

  test("updateMediaAtomic - logo change unlinks old when removeOldBinaries=true (default)", async () => {
    const store = {
      logo: { url: "/uploads/old-logo.png", kind: "image" },
      save: jest.fn().mockResolvedValue(),
    };
    unlink.mockClear();

    await svc.updateMediaAtomic(store, {
      logo: { url: "/uploads/new-logo.png", kind: "image" },
    });

    const expected = nodePath.join(process.cwd(), "uploads", "old-logo.png");
    expect(unlink).toHaveBeenCalledTimes(1);
    expect(unlink).toHaveBeenCalledWith(expected);
    expect(store.logo.url).toBe("/uploads/new-logo.png");
  });

  test("updateMediaAtomic - logo same URL does not unlink", async () => {
    const store = {
      logo: { url: "/uploads/same.png", kind: "image" },
      save: jest.fn().mockResolvedValue(),
    };
    unlink.mockClear();

    await svc.updateMediaAtomic(store, {
      logo: { url: "/uploads/same.png", kind: "image" },
    });

    expect(unlink).not.toHaveBeenCalled();
    expect(store.logo.url).toBe("/uploads/same.png");
  });

  test("updateMediaAtomic - bannerTypeStore=slider + replaceSlider=true wipes old & sets new", async () => {
    const store = {
      logo: null,
      storeSlider: [{ url: "/uploads/old1.jpg" }, { url: "/uploads/old2.jpg" }],
      save: jest.fn().mockResolvedValue(),
    };

    const payload = {
      bannerTypeStore: "slider",
      slider: ["/uploads/new1.jpg", "/uploads/new2.jpg"],
      replaceSlider: true,
    };

    await svc.updateMediaAtomic(store, payload);

    expect(unlink).toHaveBeenCalledTimes(2);
    expect(store.storeSlider.map((x) => x.url)).toEqual(["/uploads/new1.jpg", "/uploads/new2.jpg"]);
    expect(store.bannerTypeStore).toBe("slider");
    expect(store.storeBanner).toBeUndefined();
    expect(store.save).toHaveBeenCalled();
  });

  test("updateMediaAtomic - slider mode with empty slider & replaceSlider=false leaves slider unchanged", async () => {
    const store = {
      storeSlider: [{ url: "/uploads/exist.jpg" }],
      save: jest.fn().mockResolvedValue(),
    };
    unlink.mockClear();

    await svc.updateMediaAtomic(store, {
      bannerTypeStore: "slider",
      slider: [],
      replaceSlider: false,
    });

    expect(store.storeSlider.map(x => x.url)).toEqual(["/uploads/exist.jpg"]);
    expect(store.bannerTypeStore).toBe("slider");
    expect(unlink).not.toHaveBeenCalled();
  });

  test("updateMediaAtomic - static banner replaces old; mobile & list too", async () => {
    const store = {
      storeBanner : { url: "/uploads/old-banner.jpg", kind: "image" },
      mobileBanner: { url: "/uploads/old-m.jpg",     kind: "image" },
      listBanner  : { url: "/uploads/old-l.jpg",     kind: "image" },
      save: jest.fn().mockResolvedValue(),
    };
    unlink.mockClear();

    const payload = {
      bannerTypeStore: "static",
      storeBanner : { url: "/uploads/new-banner.jpg", kind: "image" },
      mobileBanner: { url: "/uploads/new-m.jpg",      kind: "image" },
      listBanner  : { url: "/uploads/new-l.jpg",      kind: "image" },
      bannerTypeList: "video",
    };

    await svc.updateMediaAtomic(store, payload, { removeOldBinaries: true });

    expect(unlink).toHaveBeenCalledTimes(3);
    expect(store.bannerTypeStore).toBe("static");
    expect(store.storeBanner.url).toBe("/uploads/new-banner.jpg");
    expect(store.mobileBanner.url).toBe("/uploads/new-m.jpg");
    expect(store.listBanner.url).toBe("/uploads/new-l.jpg");
    expect(store.bannerTypeList).toBe("video");
  });

  test("updateMediaAtomic - static same URL does not unlink", async () => {
    const store = {
      storeBanner : { url: "/uploads/same.jpg", kind: "image" },
      save: jest.fn().mockResolvedValue(),
    };
    unlink.mockClear();

    await svc.updateMediaAtomic(
      store,
      { bannerTypeStore: "static", storeBanner : { url: "/uploads/same.jpg", kind: "image" } },
      { removeOldBinaries: true }
    );

    expect(unlink).not.toHaveBeenCalled();
    expect(store.storeBanner.url).toBe("/uploads/same.jpg");
  });

  test("updateMediaAtomic - mobile same URL does not unlink", async () => {
    const store = {
      mobileBanner : { url: "/uploads/mob.jpg", kind: "image" },
      save: jest.fn().mockResolvedValue(),
    };
    unlink.mockClear();

    await svc.updateMediaAtomic(
      store,
      { mobileBanner : { url: "/uploads/mob.jpg", kind: "image" } },
      { removeOldBinaries: true }
    );

    expect(unlink).not.toHaveBeenCalled();
    expect(store.mobileBanner.url).toBe("/uploads/mob.jpg");
  });

  test("updateMediaAtomic - list banner same URL does not unlink", async () => {
    const store = {
      listBanner : { url: "/uploads/list.jpg", kind: "image" },
      save: jest.fn().mockResolvedValue(),
    };
    unlink.mockClear();

    await svc.updateMediaAtomic(
      store,
      { listBanner : { url: "/uploads/list.jpg", kind: "image" } },
      { removeOldBinaries: true }
    );

    expect(unlink).not.toHaveBeenCalled();
    expect(store.listBanner.url).toBe("/uploads/list.jpg");
  });

  test("updateMediaAtomic - bannerTypeStore='video' without storeBanner (else branch w/o inner if)", async () => {
    const store = { save: jest.fn().mockResolvedValue() };
    unlink.mockClear();

    await svc.updateMediaAtomic(store, {
      bannerTypeStore: "video", // else-branch (not slider), inner if (no storeBanner) -> skip
      // אין storeBanner
    });

    expect(store.bannerTypeStore).toBe("video");
    expect(unlink).not.toHaveBeenCalled();
    expect(store.save).toHaveBeenCalled();
  });

  test("updateMediaAtomic - defaults when payload/options omitted (payload ?? {})", async () => {
    const store = { save: jest.fn().mockResolvedValue() };
    await svc.updateMediaAtomic(store); // payload & options omitted -> בדיקת ברירות מחדל
    expect(store.bannerTypeList).toBe("static");
    expect(store.save).toHaveBeenCalled();
  });

  // ---------- updateSlugByActor ----------

  test("updateSlugByActor - scope=me without userId -> 401 (status only)", async () => {
    await expect(
      svc.updateSlugByActor({ actor: { role: "seller" }, scope: "me", desiredSlug: "x" })
    ).rejects.toMatchObject({ status: 401 });
  });

  test("updateSlugByActor - admin scope with non-admin actor -> 403", async () => {
    await expect(
      svc.updateSlugByActor({ actor: { userId: "U1", role: "seller" }, scope: "admin", storeId: "S1", desiredSlug: "x" })
    ).rejects.toMatchObject({ status: 403, message: "Forbidden" });
  });

  test("updateSlugByActor - bad scope -> 400", async () => {
    await expect(
      svc.updateSlugByActor({ actor: { userId: "U1", role: "seller" }, scope: "oops", desiredSlug: "x" })
    ).rejects.toMatchObject({ status: 400, message: "Bad scope" });
  });

  test("updateSlugByActor - store not found -> 404 (me/admin)", async () => {
    StoreMock.findOne.mockResolvedValueOnce(null);
    await expect(
      svc.updateSlugByActor({ actor: { userId: "U1", role: "seller" }, scope: "me", desiredSlug: "x" })
    ).rejects.toMatchObject({ status: 404 });

    StoreMock.findById.mockResolvedValueOnce(null);
    await expect(
      svc.updateSlugByActor({ actor: { userId: "A1", role: "admin" }, scope: "admin", storeId: "S1", desiredSlug: "x" })
    ).rejects.toMatchObject({ status: 404 });
  });

  test("updateSlugByActor - seller: only draft allowed; only once", async () => {
    StoreMock.findOne.mockResolvedValueOnce({ status: "active", slugChanged: false });
    await expect(
      svc.updateSlugByActor({ actor: { userId: "U1", role: "seller" }, scope: "me", desiredSlug: "x" })
    ).rejects.toMatchObject({ status: 400, message: "אפשר לשנות סלוג רק בטיוטה" });

    StoreMock.findOne.mockResolvedValueOnce({ status: "draft", slugChanged: true });
    await expect(
      svc.updateSlugByActor({ actor: { userId: "U1", role: "seller" }, scope: "me", desiredSlug: "x" })
    ).rejects.toMatchObject({ status: 400, message: "אפשר לשנות סלוג פעם אחת בלבד" });
  });

  test("updateSlugByActor - desiredSlug empty -> 400", async () => {
    StoreMock.findOne.mockResolvedValueOnce({ status: "draft", slugChanged: false, save: jest.fn() });
    await expect(
      svc.updateSlugByActor({ actor: { userId: "U1", role: "seller" }, scope: "me", desiredSlug: "" })
    ).rejects.toMatchObject({ status: 400, message: "חסר slug" });
  });

  test("updateSlugByActor - normalizeUserSlug returns empty -> 400", async () => {
    normalizeUserSlug.mockReturnValueOnce("");
    StoreMock.findOne.mockResolvedValueOnce({ status: "draft", slugChanged: false, save: jest.fn() });
    await expect(
      svc.updateSlugByActor({ actor: { userId: "U1", role: "seller" }, scope: "me", desiredSlug: "___" })
    ).rejects.toMatchObject({ status: 400, message: "slug לא תקין" });
  });

  test("updateSlugByActor - seller success; uniqueness adds suffix", async () => {
    const store = { _id: "S1", status: "draft", slugChanged: false, save: jest.fn().mockResolvedValue() };
    StoreMock.findOne.mockResolvedValueOnce(store);
    StoreMock.exists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const res = await svc.updateSlugByActor({
      actor: { userId: "U1", role: "seller" },
      scope: "me",
      desiredSlug: "My Store",
    });

    expect(normalizeUserSlug).toHaveBeenCalledWith("My Store");
    expect(res).toEqual({ slug: "my-store-2" });
    expect(store.slugChanged).toBe(true);
    expect(store.save).toHaveBeenCalled();
  });

  test("updateSlugByActor - admin success; does not set slugChanged", async () => {
    const store = { _id: "S2", status: "active", save: jest.fn().mockResolvedValue() };
    StoreMock.findById.mockResolvedValueOnce(store);
    StoreMock.exists.mockResolvedValueOnce(false);

    const res = await svc.updateSlugByActor({
      actor: { userId: "A1", role: "admin" },
      scope: "admin",
      storeId: "S2",
      desiredSlug: "Admin Slug",
    });

    expect(res).toEqual({ slug: "admin-slug" });
    expect(store.slugChanged).toBeUndefined();
  });

  // ---------- _uniqueSlug (כיסוי ישיר) ----------

  test("_uniqueSlug - no collisions returns base; collisions add -N", async () => {
    StoreMock.exists.mockResolvedValueOnce(false);
    await expect(svc._uniqueSlug("x", "IGN")).resolves.toBe("x");

    StoreMock.exists
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    await expect(svc._uniqueSlug("x", "IGN")).resolves.toBe("x-3");
  });

  // ---------- updateStatusByActor ----------

  test("updateStatusByActor - invalid status -> 400", async () => {
    await expect(
      svc.updateStatusByActor({ actor: { userId: "U1", role: "seller" }, scope: "me", status: "weird" })
    ).rejects.toMatchObject({ status: 400, message: "סטטוס לא תקין" });
  });

  test("updateStatusByActor - scope=me without userId -> 401 (status only)", async () => {
    await expect(
      svc.updateStatusByActor({ actor: { role: "seller" }, scope: "me", status: "active" })
    ).rejects.toMatchObject({ status: 401 });
  });

  test("updateStatusByActor - scope=me store not found -> 404", async () => {
    StoreMock.findOne.mockResolvedValueOnce(null);
    await expect(
      svc.updateStatusByActor({ actor: { userId: "U1", role: "seller" }, scope: "me", status: "active" })
    ).rejects.toMatchObject({ status: 404 });
  });

  test("updateStatusByActor - seller can only draft->active", async () => {
    StoreMock.findOne.mockResolvedValueOnce({ status: "active" });
    await expect(
      svc.updateStatusByActor({ actor: { userId: "U1", role: "seller" }, scope: "me", status: "active" })
    ).rejects.toMatchObject({ status: 400, message: "מוכר יכול לפרסם רק מטיוטה" });
  });

  test("updateStatusByActor - admin path: requires admin; not found; success", async () => {
    await expect(
      svc.updateStatusByActor({ actor: { userId: "U1", role: "seller" }, scope: "admin", storeId: "S1", status: "draft" })
    ).rejects.toMatchObject({ status: 403, message: "Forbidden" });

    StoreMock.findById.mockResolvedValueOnce(null);
    await expect(
      svc.updateStatusByActor({ actor: { userId: "A1", role: "admin" }, scope: "admin", storeId: "S1", status: "draft" })
    ).rejects.toMatchObject({ status: 404 });

    const store = { status: "draft", save: jest.fn().mockResolvedValue() };
    StoreMock.findById.mockResolvedValueOnce(store);

    const res = await svc.updateStatusByActor({
      actor: { userId: "A1", role: "admin" },
      scope: "admin",
      storeId: "S1",
      status: "suspended",
      note: "violation",
    });

    expect(res).toBe(store);
    expect(store.status).toBe("suspended");
    expect(store.lastAction).toMatchObject({
      by: "A1", role: "admin", action: "update-status", note: "violation",
    });
    expect(store.save).toHaveBeenCalled();
  });

  test("updateStatusByActor - seller success: draft->active (note defaults to empty string)", async () => {
    const store = { status: "draft", save: jest.fn().mockResolvedValue() };
    StoreMock.findOne.mockResolvedValueOnce(store);

    const res = await svc.updateStatusByActor({
      actor: { userId: "U1", role: "seller" },
      scope: "me",
      status: "active",
    });

    expect(res).toBe(store);
    expect(store.status).toBe("active");
    expect(store.lastAction).toMatchObject({ by: "U1", role: "seller", action: "update-status", note: "" });
  });

  test("updateStatusByActor - bad scope -> 400", async () => {
    await expect(
      svc.updateStatusByActor({ actor: { userId: "U1", role: "seller" }, scope: "weird", status: "draft" })
    ).rejects.toMatchObject({ status: 400, message: "Bad scope" });
  });
});
