// __tests__/__controllers__/storeController.test.js
// ---- נתיבים לפי העץ שלך ----
const CONTROLLER_PATH = "../../controllers/store.controller.js";
const SERVICE_PATH    = "../../service/store.service.js";
// -----------------------------------

import { jest } from "@jest/globals";
import nodePath from "path";

// ---- Mock Service instance that controller constructs ----
const svcApi = {
  getByUserId:          jest.fn(),
  create:               jest.fn(),
  update:               jest.fn(),
  updateMediaAtomic:    jest.fn(),
  updateSlugByActor:    jest.fn(),
  updateStatusByActor:  jest.fn(),
};
const ServiceCtor = jest.fn().mockImplementation(() => svcApi);

jest.unstable_mockModule(SERVICE_PATH, () => ({
  default: ServiceCtor,
}));

// ---- Mocks for dynamic imports used in uploadAllMedia catch() ----
const unlink = jest.fn().mockResolvedValue();
const pathJoinMock = jest.fn(nodePath.join);
const pathResolveMock = jest.fn((...args) => nodePath.resolve(...args));

jest.unstable_mockModule("fs/promises", () => ({
  default: { unlink },
  unlink,
}));

jest.unstable_mockModule("path", () => ({
  default: { join: pathJoinMock, resolve: pathResolveMock },
  join: pathJoinMock,
  resolve: pathResolveMock,
}));

// --- load controller after mocks
const { default: StoreController } = await import(CONTROLLER_PATH);

const makeRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json:   jest.fn(),
  };
  return res;
};
const makeNext = () => jest.fn();

describe("StoreController", () => {
  let controller;

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new StoreController();
  });

  // -------- getMyStore --------
  test("getMyStore → 401 when no userId", async () => {
    const req = { user: null };
    const res = makeRes();
    const next = makeNext();

    await controller.getMyStore(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test("getMyStore → returns null when store not found", async () => {
    svcApi.getByUserId.mockResolvedValueOnce(null);
    const req = { user: { userId: "U1" } };
    const res = makeRes();
    const next = makeNext();

    await controller.getMyStore(req, res, next);
    expect(svcApi.getByUserId).toHaveBeenCalledWith("U1");
    expect(res.json).toHaveBeenCalledWith(null);
  });

  test("getMyStore → returns store on success", async () => {
    const store = { _id: "S1" };
    svcApi.getByUserId.mockResolvedValueOnce(store);

    const req = { user: { userId: "U2" } };
    const res = makeRes();
    const next = makeNext();

    await controller.getMyStore(req, res, next);
    expect(res.json).toHaveBeenCalledWith(store);
    expect(next).not.toHaveBeenCalled();
  });

  test("getMyStore → next(err) on thrown error", async () => {
    const err = new Error("boom");
    svcApi.getByUserId.mockRejectedValueOnce(err);

    const req = { user: { userId: "U3" } };
    const res = makeRes();
    const next = makeNext();

    await controller.getMyStore(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // -------- saveMyStore --------
  test("saveMyStore → 401 when no userId or no sellerId", async () => {
    const res = makeRes();
    const next = makeNext();

    await controller.saveMyStore({ user: { userId: null }, body: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);

    res.status.mockClear(); res.json.mockClear();
    await controller.saveMyStore({ user: { userId: "U1", sellerId: null }, body: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("saveMyStore → create when store missing; filters slug fields", async () => {
    svcApi.getByUserId.mockResolvedValueOnce(null);
    svcApi.create.mockResolvedValueOnce({ _id: "SNEW" });

    const req = {
      user: { userId: "U1", sellerId: "SEL1", role: "seller" },
      body: {
        name: "MyStore",
        slug: "bad",
        slugChanged: true,
        status: "active",
        contactEmail: "a@b.com",
      },
    };
    const res = makeRes();
    const next = makeNext();

    await controller.saveMyStore(req, res, next);

    const [, , clean, actor] = svcApi.create.mock.calls[0];
    expect(clean).toEqual({ name: "MyStore", contactEmail: "a@b.com" });
    expect(actor).toEqual({ userId: "U1", role: "seller" });

    expect(res.json).toHaveBeenCalledWith({ _id: "SNEW" });
  });

  test("saveMyStore → update when store exists; filters slug fields", async () => {
    const existing = { _id: "S1" };
    svcApi.getByUserId.mockResolvedValueOnce(existing);
    svcApi.update.mockResolvedValueOnce({ _id: "S1", name: "Updated" });

    const req = {
      user: { userId: "U1", sellerId: "SEL1", role: "seller" },
      body: { name: "Updated", slug: "bad", status: "active" },
    };
    const res = makeRes();
    const next = makeNext();

    await controller.saveMyStore(req, res, next);

    const [storeArg, clean, actor] = svcApi.update.mock.calls[0];
    expect(storeArg).toBe(existing);
    expect(clean).toEqual({ name: "Updated" });
    expect(actor).toEqual({ userId: "U1", role: "seller" });

    expect(res.json).toHaveBeenCalledWith({ _id: "S1", name: "Updated" });
  });

  test("saveMyStore → next(err) on thrown error", async () => {
    const err = new Error("save-fail");
    svcApi.getByUserId.mockResolvedValueOnce(null);
    svcApi.create.mockRejectedValueOnce(err);

    const req = { user: { userId: "U1", sellerId: "SEL1", role: "seller" }, body: {} };
    const res = makeRes();
    const next = makeNext();

    await controller.saveMyStore(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // -------- uploadAllMedia --------
  test("uploadAllMedia → 401 when no userId", async () => {
    const req = { user: null, processedMedia: {} };
    const res = makeRes();
    const next = makeNext();

    await controller.uploadAllMedia(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  test("uploadAllMedia → 404 when no store", async () => {
    svcApi.getByUserId.mockResolvedValueOnce(null);

    const req = { user: { userId: "U1" }, processedMedia: {} };
    const res = makeRes();
    const next = makeNext();

    await controller.uploadAllMedia(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Store not found. Save basic info first." });
  });

  test("uploadAllMedia → success path calls updateMediaAtomic with correct payload", async () => {
    const store = { _id: "S1" };
    svcApi.getByUserId.mockResolvedValueOnce(store);
    const updated = { _id: "S1", name: "after" };
    svcApi.updateMediaAtomic.mockResolvedValueOnce(updated);

    const req = {
      user: { userId: "U1" },
      processedMedia: {
        _newUrls: ["/uploads/a.jpg"],
        logo: { url: "/uploads/logo.png", kind: "image" },
        storeBanner: { url: "/uploads/store.jpg", kind: "image" },
        mobileBanner: { url: "/uploads/mobile.jpg", kind: "image" },
        listBanner: { url: "/uploads/list.jpg", kind: "image" },
        slider: ["/uploads/s1.jpg", "/uploads/s2.jpg"],
        bannerTypeStore: "slider",
        bannerTypeList: "static",
        replaceSlider: true,
      },
    };
    const res = makeRes();
    const next = makeNext();

    await controller.uploadAllMedia(req, res, next);

    expect(svcApi.updateMediaAtomic).toHaveBeenCalledWith(
      store,
      {
        logo: req.processedMedia.logo,
        storeBanner: req.processedMedia.storeBanner,
        mobileBanner: req.processedMedia.mobileBanner,
        listBanner: req.processedMedia.listBanner,
        slider: req.processedMedia.slider,
        bannerTypeStore: "slider",
        bannerTypeList: "static",
        replaceSlider: true,
      },
      { removeOldBinaries: true }
    );

    expect(res.json).toHaveBeenCalledWith({ ok: true, store: updated });
    expect(unlink).not.toHaveBeenCalled();
  });

  test("uploadAllMedia → error path: cleans only /uploads/* and calls next(err)", async () => {
    const store = { _id: "S1" };
    svcApi.getByUserId.mockResolvedValueOnce(store);

    const err = new Error("media-fail");
    svcApi.updateMediaAtomic.mockRejectedValueOnce(err);

    const req = {
      user: { userId: "U1" },
      processedMedia: {
        _newUrls: [
          "/uploads/tmp1.png",              // יימחק
          "https://cdn/remote.jpg",         // לא יימחק
          "/notuploads/tmp2.png",           // לא יימחק
        ],
      },
    };
    const res = makeRes();
    const next = makeNext();

    unlink.mockClear();
    pathJoinMock.mockClear();
    pathResolveMock.mockClear();

    await controller.uploadAllMedia(req, res, next);

    const uploadsDir = nodePath.resolve(process.cwd(), "uploads");
    expect(pathResolveMock).toHaveBeenCalledWith(uploadsDir, "tmp1.png");
    expect(unlink).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(err);
  });

  // ★ חדש: מכסה את ענף ה-path traversal (השורה שחסרה בכיסוי)
  test("uploadAllMedia → error path: skips traversal out of uploads (../../evil.txt)", async () => {
    const store = { _id: "S1" };
    svcApi.getByUserId.mockResolvedValueOnce(store);

    const err = new Error("media-fail-traversal");
    svcApi.updateMediaAtomic.mockRejectedValueOnce(err);

    const req = {
      user: { userId: "U1" },
      processedMedia: {
        _newUrls: ["/uploads/../../evil.txt"], // יזוהה, אבל יידחה במחיקה ע״י startsWith
      },
    };
    const res = makeRes();
    const next = makeNext();

    unlink.mockClear();
    pathJoinMock.mockClear();
    pathResolveMock.mockClear();

    await controller.uploadAllMedia(req, res, next);

    const uploadsDir = nodePath.resolve(process.cwd(), "uploads");
    // וידוא שקראנו ל-resolve עם הנתיב הבעייתי:
    expect(pathResolveMock).toHaveBeenCalledWith(uploadsDir, "../../evil.txt");
    // אבל בפועל לא בוצעה מחיקה (abs לא מתחיל ב-uploadsDir)
    expect(unlink).not.toHaveBeenCalled();
    // next קיבל את שגיאת ה-service
    expect(next).toHaveBeenCalledWith(err);
  });

  test("uploadAllMedia → error path with processedMedia undefined: next(err) and no deletions", async () => {
    const store = { _id: "S1" };
    svcApi.getByUserId.mockResolvedValueOnce(store);

    const err = new Error("media-fail-2");
    svcApi.updateMediaAtomic.mockRejectedValueOnce(err);

    const req = { user: { userId: "U1" }, processedMedia: undefined };
    const res = makeRes();
    const next = makeNext();

    unlink.mockClear();
    pathJoinMock.mockClear();
    pathResolveMock.mockClear();

    await controller.uploadAllMedia(req, res, next);

    expect(svcApi.updateMediaAtomic).toHaveBeenCalled(); // destructuring בטוח
    expect(unlink).not.toHaveBeenCalled();               // לא היו _newUrls
    expect(next).toHaveBeenCalledWith(err);
  });

  // -------- updateMySlug --------
  test("updateMySlug → 400 when missing slug in body", async () => {
    const req = { user: { userId: "U1", role: "seller" }, body: {} };
    const res = makeRes();
    const next = makeNext();

    await controller.updateMySlug(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "חסר slug" });
    expect(svcApi.updateSlugByActor).not.toHaveBeenCalled();
  });

  test("updateMySlug → success returns { success, slug }", async () => {
    svcApi.updateSlugByActor.mockResolvedValueOnce({ slug: "new-slug" });

    const req = { user: { userId: "U1", role: "seller" }, body: { slug: "  New-Slug  " } };
    const res = makeRes();
    const next = makeNext();

    await controller.updateMySlug(req, res, next);

    expect(svcApi.updateSlugByActor).toHaveBeenCalledWith({
      actor: { userId: "U1", role: "seller" },
      scope: "me",
      desiredSlug: "New-Slug",
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, slug: "new-slug" });
  });

  test("updateMySlug → next(err) when service throws", async () => {
    const err = new Error("slug-fail");
    svcApi.updateSlugByActor.mockRejectedValueOnce(err);

    const req = { user: { userId: "U1", role: "seller" }, body: { slug: "x" } };
    const res = makeRes();
    const next = makeNext();

    await controller.updateMySlug(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // -------- adminUpdateSlug --------
  test("adminUpdateSlug → success (uses desiredSlug)", async () => {
    svcApi.updateSlugByActor.mockResolvedValueOnce({ slug: "ok-admin" });

    const req = { user: { userId: "A1", role: "admin" }, params: { id: "S1" }, body: { slug: "Admin-Slug" } };
    const res = makeRes();
    const next = makeNext();

    await controller.adminUpdateSlug(req, res, next);

    expect(svcApi.updateSlugByActor).toHaveBeenCalledWith({
      actor: { userId: "A1", role: "admin" },
      scope: "admin",
      storeId: "S1",
      desiredSlug: "Admin-Slug",
    });

    expect(res.json).toHaveBeenCalledWith({ success: true, slug: "ok-admin" });
  });

  test("adminUpdateSlug → next(err) on error", async () => {
    const err = new Error("admin-slug-fail");
    svcApi.updateSlugByActor.mockRejectedValueOnce(err);

    const req = { user: { userId: "A1", role: "admin" }, params: { id: "S1" }, body: { slug: "X" } };
    const res = makeRes();
    const next = makeNext();

    await controller.adminUpdateSlug(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // -------- updateMyStatus --------
  test("updateMyStatus → success", async () => {
    const updated = { _id: "S1", status: "active" };
    svcApi.updateStatusByActor.mockResolvedValueOnce(updated);

    const req = { user: { userId: "U1", role: "seller" }, body: { status: "active" } };
    const res = makeRes();
    const next = makeNext();

    await controller.updateMyStatus(req, res, next);

    expect(svcApi.updateStatusByActor).toHaveBeenCalledWith({
      actor: { userId: "U1", role: "seller" },
      scope: "me",
      status: "active",
    });
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test("updateMyStatus → next(err) on error", async () => {
    const err = new Error("status-fail");
    svcApi.updateStatusByActor.mockRejectedValueOnce(err);

    const req = { user: { userId: "U1", role: "seller" }, body: { status: "active" } };
    const res = makeRes();
    const next = makeNext();

    await controller.updateMyStatus(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // -------- adminUpdateStoreStatus --------
  test("adminUpdateStoreStatus → success", async () => {
    const updated = { _id: "S1", status: "suspended" };
    svcApi.updateStatusByActor.mockResolvedValueOnce(updated);

    const req = {
      user: { userId: "A1", role: "admin" },
      params: { id: "S1" },
      body: { status: "suspended", note: "violation" },
    };
    const res = makeRes();
    const next = makeNext();

    await controller.adminUpdateStoreStatus(req, res, next);

    expect(svcApi.updateStatusByActor).toHaveBeenCalledWith({
      actor: { userId: "A1", role: "admin" },
      scope: "admin",
      storeId: "S1",
      status: "suspended",
      note: "violation",
    });
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test("adminUpdateStoreStatus → next(err) on error", async () => {
    const err = new Error("admin-status-fail");
    svcApi.updateStatusByActor.mockRejectedValueOnce(err);

    const req = {
      user: { userId: "A1", role: "admin" },
      params: { id: "S1" },
      body: { status: "suspended", note: "n" },
    };
    const res = makeRes();
    const next = makeNext();

    await controller.adminUpdateStoreStatus(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
