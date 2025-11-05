import { jest } from "@jest/globals";

// ---- מוקים ל-middlewares ----
const authMiddlewareMock = jest.fn((req, res, next) => next());
const requireRolesMock = jest.fn((...roles) => {
    const mw = (req, res, next) => next();
    // טאג קטן כדי שנוכל לאמת את התפקידים שהוזרקו לכל route
    mw._roles = roles;
    return mw;
});

jest.unstable_mockModule("../../middlewares/auth.js", () => ({
    __esModule: true,
    authMiddleware: authMiddlewareMock,
}));

jest.unstable_mockModule("../../middlewares/requireRoles.js", () => ({
    __esModule: true,
    requireRoles: requireRolesMock,
}));

// ---- מוקים לקונטרולר (מחזיר אינסטנס עם מתודות jest.fn) ----
const ctrlInstance = {
    list: jest.fn(),
    create: jest.fn(),
    getOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    updateStatus: jest.fn(),
};
const SellerProductsControllerMock = jest.fn(() => ctrlInstance);

jest.unstable_mockModule("../../controllers/sellerProducts.controller", () => ({
    __esModule: true,
    default: SellerProductsControllerMock,
}));

// ייבוא הראוטר רק אחרי שכל המוקים הוגדרו
const { sellerProductsRouter } = await import("../../router/seller.products.router.js");
const { authMiddleware } = await import("../../middlewares/auth.js");
const { requireRoles } = await import("../../middlewares/requireRoles.js");

// עזר: לאתר שכבה לפי method+path
const findRouteLayer = (router, method, path) => {
    return router.stack.find(
        (layer) => layer.route && layer.route.path === path && !!layer.route.methods[method]
    );
};

afterEach(() => {
    jest.clearAllMocks();
});

describe("sellerProductsRouter", () => {
    it("מייצר אינסטנס של הקונטרולר בדיוק פעם אחת", () => {
        expect(SellerProductsControllerMock).toHaveBeenCalledTimes(1);
    });

    it("GET / → [auth, requireRoles('seller','admin'), ctrl.list]", () => {
        const layer = findRouteLayer(sellerProductsRouter, "get", "/");
        expect(layer).toBeTruthy();

        // 3 middlewares/handlers בסדר שהוגדר
        expect(layer.route.stack).toHaveLength(3);
        const [mwAuth, mwRoles, handler] = layer.route.stack;

        expect(mwAuth.handle).toBe(authMiddleware);
        expect(mwRoles.handle._roles).toEqual(["seller", "admin"]);
        expect(handler.handle).toBe(ctrlInstance.list);
    });

    it("POST / → [auth, requireRoles, ctrl.create]", () => {
        const layer = findRouteLayer(sellerProductsRouter, "post", "/");
        expect(layer.route.stack[0].handle).toBe(authMiddleware);
        expect(layer.route.stack[1].handle._roles).toEqual(["seller", "admin"]);
        expect(layer.route.stack[2].handle).toBe(ctrlInstance.create);
    });

    it("GET /:id → ctrl.getOne", () => {
        const layer = findRouteLayer(sellerProductsRouter, "get", "/:id");
        expect(layer.route.stack[0].handle).toBe(authMiddleware);
        expect(layer.route.stack[1].handle._roles).toEqual(["seller", "admin"]);
        expect(layer.route.stack[2].handle).toBe(ctrlInstance.getOne);
    });

    it("PATCH /:id → ctrl.update", () => {
        const layer = findRouteLayer(sellerProductsRouter, "patch", "/:id");
        expect(layer.route.stack[0].handle).toBe(authMiddleware);
        expect(layer.route.stack[1].handle._roles).toEqual(["seller", "admin"]);
        expect(layer.route.stack[2].handle).toBe(ctrlInstance.update);
    });

    it("DELETE /:id → ctrl.softDelete", () => {
        const layer = findRouteLayer(sellerProductsRouter, "delete", "/:id");
        expect(layer.route.stack[0].handle).toBe(authMiddleware);
        expect(layer.route.stack[1].handle._roles).toEqual(["seller", "admin"]);
        expect(layer.route.stack[2].handle).toBe(ctrlInstance.softDelete);
    });

    it("PATCH /:id/restore → ctrl.restore", () => {
        const layer = findRouteLayer(sellerProductsRouter, "patch", "/:id/restore");
        expect(layer.route.stack[0].handle).toBe(authMiddleware);
        expect(layer.route.stack[1].handle._roles).toEqual(["seller", "admin"]);
        expect(layer.route.stack[2].handle).toBe(ctrlInstance.restore);
    });

    it("PATCH /:id/status → ctrl.updateStatus", () => {
        const layer = findRouteLayer(sellerProductsRouter, "patch", "/:id/status");
        expect(layer.route.stack[0].handle).toBe(authMiddleware);
        expect(layer.route.stack[1].handle._roles).toEqual(["seller", "admin"]);
        expect(layer.route.stack[2].handle).toBe(ctrlInstance.updateStatus);
    });

    it("כל הראוטים משתמשים ב-requireRoles('seller','admin') בדיוק פעם אחת כל אחד", () => {
        const routeLayers = sellerProductsRouter.stack.filter((l) => l.route);

        for (const layer of routeLayers) {
            const roleMws = layer.route.stack.filter(
                (s) => Array.isArray(s.handle?._roles) && s.handle._roles.join(",") === "seller,admin"
            );
            expect(roleMws).toHaveLength(1);
        }
    });

});
