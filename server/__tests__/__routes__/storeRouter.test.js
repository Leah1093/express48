const ROUTER_PATH      = "../../router/store.router.js";      
const CONTROLLER_SPEC  = "../../controllers/store.controller.js";
const AUTH_SPEC        = "../../middlewares/auth.js";
const ROLES_SPEC       = "../../middlewares/requireRoles.js";
const UPLOAD_SPEC      = "../../middlewares/uploadMedia.middleware.js";
const VALIDATE_SPEC    = "../../middlewares/validate.js";
const SELLER_SCHEMA    = "../../validations/seller.schema.js";
const STORE_SCHEMA     = "../../validations/store.schema.js";

import { jest } from "@jest/globals";
import nodePath from "path";

// --- מוקים לסכמות (נשתמש בזהות-אובייקט בבדיקות) ---
const idParamsSchema = { _tag: "idParamsSchema" };
const updateStoreStatusSchema = { _tag: "updateStoreStatusSchema" };

jest.unstable_mockModule(SELLER_SCHEMA, () => ({ idParamsSchema }));
jest.unstable_mockModule(STORE_SCHEMA,  () => ({ updateStoreStatusSchema }));

// --- מוקים למידלוורים — סמנים (sentinels) לזיהוי בסדר הקריאות ---
const authMiddleware = jest.fn((req, res, next) => next?.());
jest.unstable_mockModule(AUTH_SPEC, () => ({ authMiddleware }));

const roleMwSeller = function roleSeller(req, res, next) { return next?.(); };
const roleMwAdmin  = function roleAdmin(req, res, next)  { return next?.(); };
const requireRoles = jest.fn((role) => {
  if (role === "seller") return roleMwSeller;
  if (role === "admin")  return roleMwAdmin;
  throw new Error("unexpected role in test");
});
jest.unstable_mockModule(ROLES_SPEC, () => ({ requireRoles }));

const uploadStoreMedia  = function uploadStoreMedia(req, res, next) { return next?.(); };
const processStoreMedia = function processStoreMedia(req, res, next){ return next?.(); };
jest.unstable_mockModule(UPLOAD_SPEC, () => ({
  uploadStoreMedia, processStoreMedia,
}));

// validate(schema, where) → מחזיר מידלוור ייחודי עם מטא-מידע לזיהוי
const validate = jest.fn((schema, where) => {
  const fn = function validateMw(req, res, next) { return next?.(); };
  fn._schema = schema;
  fn._where  = where;
  return fn;
});
jest.unstable_mockModule(VALIDATE_SPEC, () => ({ validate }));

// --- מוק לקונטרולר: אינסטנס עם פונקציות ייחודיות לכל פעולה ---
const ctrlFns = {
  getMyStore:              function getMyStore() {},
  saveMyStore:             function saveMyStore() {},
  uploadAllMedia:          function uploadAllMedia() {},
  updateMySlug:            function updateMySlug() {},
  adminUpdateSlug:         function adminUpdateSlug() {},
  updateMyStatus:          function updateMyStatus() {},
  adminUpdateStoreStatus:  function adminUpdateStoreStatus() {},
};
const StoreControllerMock = jest.fn().mockImplementation(() => ({ ...ctrlFns }));
jest.unstable_mockModule(CONTROLLER_SPEC, () => ({ default: StoreControllerMock }));

// --- מוק ל-express.Router כדי ללכוד רישומים של ראוטים ---
const calls = []; // { method, path, handlers[] }
const buildHandlerRecorder = (method) =>
  jest.fn((path, ...handlers) => calls.push({ method, path, handlers }));

const routerObj = {
  get:   buildHandlerRecorder("get"),
  put:   buildHandlerRecorder("put"),
  post:  buildHandlerRecorder("post"),
  patch: buildHandlerRecorder("patch"),
};
const Router = jest.fn(() => routerObj);

jest.unstable_mockModule("express", () => ({
  default: { Router },
  __routerMock: { Router, routerObj, calls },
}));

// --- טוענים את הראוטר אחרי כל המוקים ---
const { storeRouter } = await import(ROUTER_PATH);
const expressMock = await import("express");

const makeRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json:   jest.fn(),
  };
  return res;
};
const makeNext = () => jest.fn();

// ⚠️ אל תאפסו את calls כאן — הרישום של הראוטים מתבצע כבר בזמן import!
describe("store.router wiring", () => {
  let findRoute;
  beforeAll(() => {
    findRoute = (method, path) =>
      expressMock.__routerMock.calls.find((c) => c.method === method && c.path === path) || null;
  });

  test("creates a Router and exports it", () => {
    expect(expressMock.__routerMock.Router).toHaveBeenCalledTimes(1);
    expect(storeRouter).toBe(expressMock.__routerMock.routerObj);
    expect(StoreControllerMock).toHaveBeenCalledTimes(1);
  });

  test("GET /me: [auth, requireRoles('seller'), ctrl.getMyStore]", () => {
    const r = findRoute("get", "/me");
    expect(r).toBeTruthy();
    expect(r.handlers).toEqual([authMiddleware, roleMwSeller, ctrlFns.getMyStore]);
    expect(requireRoles).toHaveBeenCalledWith("seller");
  });

  test("PUT /me: [auth, requireRoles('seller'), ctrl.saveMyStore]", () => {
    const r = findRoute("put", "/me");
    expect(r).toBeTruthy();
    expect(r.handlers).toEqual([authMiddleware, roleMwSeller, ctrlFns.saveMyStore]);
    expect(requireRoles).toHaveBeenCalledWith("seller");
  });

  test("POST /me/media: [auth, requireRoles('seller'), uploadStoreMedia, processStoreMedia, ctrl.uploadAllMedia]", () => {
    const r = findRoute("post", "/me/media");
    expect(r).toBeTruthy();
    expect(r.handlers).toEqual([authMiddleware, roleMwSeller, uploadStoreMedia, processStoreMedia, ctrlFns.uploadAllMedia]);
    expect(requireRoles).toHaveBeenCalledWith("seller");
  });

  test("PUT /me/slug: [auth, requireRoles('seller'), ctrl.updateMySlug]", () => {
    const r = findRoute("put", "/me/slug");
    expect(r).toBeTruthy();
    expect(r.handlers).toEqual([authMiddleware, roleMwSeller, ctrlFns.updateMySlug]);
    expect(requireRoles).toHaveBeenCalledWith("seller");
  });

  test("PUT /admin/:id/slug: [auth, requireRoles('admin'), validate(idParamsSchema,'params'), ctrl.adminUpdateSlug]", () => {
    const r = findRoute("put", "/admin/:id/slug");
    expect(r).toBeTruthy();

    const [a0, a1, v, ctrl] = r.handlers;
    expect([a0, a1]).toEqual([authMiddleware, roleMwAdmin]);
    expect(v._schema).toBe(idParamsSchema);
    expect(v._where).toBe("params");
    expect(ctrl).toBe(ctrlFns.adminUpdateSlug);

    expect(validate).toHaveBeenCalledWith(idParamsSchema, "params");
    expect(requireRoles).toHaveBeenCalledWith("admin");
  });

  test("PUT /me/status: [auth, requireRoles('seller'), validate(updateStoreStatusSchema,'body'), ctrl.updateMyStatus]", () => {
    const r = findRoute("put", "/me/status");
    expect(r).toBeTruthy();

    const [a0, a1, v, ctrl] = r.handlers;
    expect([a0, a1]).toEqual([authMiddleware, roleMwSeller]);
    expect(v._schema).toBe(updateStoreStatusSchema);
    expect(v._where).toBe("body");
    expect(ctrl).toBe(ctrlFns.updateMyStatus);

    expect(validate).toHaveBeenCalledWith(updateStoreStatusSchema, "body");
  });

  test("PATCH /admin/:id/status: [auth, requireRoles('admin'), validate(idParamsSchema,'params'), validate(updateStoreStatusSchema,'body'), ctrl.adminUpdateStoreStatus]", () => {
    const r = findRoute("patch", "/admin/:id/status");
    expect(r).toBeTruthy();

    const [a0, a1, vParams, vBody, ctrl] = r.handlers;
    expect([a0, a1]).toEqual([authMiddleware, roleMwAdmin]);
    expect(vParams._schema).toBe(idParamsSchema);
    expect(vParams._where).toBe("params");
    expect(vBody._schema).toBe(updateStoreStatusSchema);
    expect(vBody._where).toBe("body");
    expect(ctrl).toBe(ctrlFns.adminUpdateStoreStatus);

    expect(validate).toHaveBeenCalledWith(idParamsSchema, "params");
    expect(validate).toHaveBeenCalledWith(updateStoreStatusSchema, "body");
  });

  test("validate called exactly 4 times with correct schemas/targets", () => {
    expect(validate).toHaveBeenCalledTimes(4);
    const vCalls = validate.mock.calls.map(([schema, where]) => ({ schema, where }));

    expect(vCalls).toEqual(
      expect.arrayContaining([
        { schema: idParamsSchema, where: "params" },          // PUT /admin/:id/slug
        { schema: updateStoreStatusSchema, where: "body" },   // PUT /me/status
        { schema: idParamsSchema, where: "params" },          // PATCH /admin/:id/status (params)
        { schema: updateStoreStatusSchema, where: "body" },   // PATCH /admin/:id/status (body)
      ])
    );
  });
});
