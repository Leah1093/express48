import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

/** --- רישום סדר להרצה --- */
const step = (req, label) => {
  req._order = req._order || [];
  req._order.push(label);
};

/** --- מוקים למידלוורים --- */
jest.unstable_mockModule("../../middlewares/auth.js", () => ({
  authMiddleware: (req, _res, next) => { step(req, "auth"); req.user = { _id: "u" }; next(); },
}));

jest.unstable_mockModule("../../middlewares/isSeller.middleware.js", () => ({
  isSellerMiddleware: (req, _res, next) => { step(req, "isSeller"); next(); },
}));

let requiredRolesSeen = [];
jest.unstable_mockModule("../../middlewares/requireRoles.js", () => ({
  requireRoles: (...roles) => (req, _res, next) => {
    step(req, `requireRoles(${roles.join(",")})`);
    requiredRolesSeen.push(roles);
    next();
  },
}));

// rate limiters
jest.unstable_mockModule("../../middlewares/rateLimit.middleware.js", () => ({
  createRatingLimiter: (req, _res, next) => { step(req, "createRatingLimiter"); next(); },
  editRatingLimiter:   (req, _res, next) => { step(req, "editRatingLimiter"); next(); },
  helpfulLimiter:      (req, _res, next) => { step(req, "helpfulLimiter"); next(); },
  sellerReplyLimiter:  (req, _res, next) => { step(req, "sellerReplyLimiter"); next(); },
}));

// validate + סכימות
jest.unstable_mockModule("../../middlewares/validate.js", () => ({
  validate: (schema, where) => (req, _res, next) => {
    const tag = schema && schema._tag ? schema._tag : "unknown";
    step(req, `validate(${where}:${tag})`);
    next();
  },
}));

jest.unstable_mockModule("../../validations/ratingSchemas.js", () => ({
  createRatingSchema:           { _tag: "createRatingSchema" },
  updateRatingSchema:           { _tag: "updateRatingSchema" },
  updateSellerReplySchema:      { _tag: "updateSellerReplySchema" },
  listMyRatingsQuerySchema:     { _tag: "listMyRatingsQuerySchema" },
  getMyRatingParamsSchema:      { _tag: "getMyRatingParamsSchema" },
  setHelpfulVoteSchema:         { _tag: "setHelpfulVoteSchema" },
  listSellerRatingsQuerySchema: { _tag: "listSellerRatingsQuerySchema" },
  sellerRatingsStatsQuerySchema:{ _tag: "sellerRatingsStatsQuerySchema" },
  createSellerReplySchema:      { _tag: "createSellerReplySchema" },
  sellerReplyVisibilitySchema:  { _tag: "sellerReplyVisibilitySchema" },
}));

/** --- מוקים לקונטרולרים: שולחים JSON עם ה־order --- */
function mkController(routeName) {
  return (_req, res) => {
    const order = _req._order || [];
    res.json({ route: routeName, order });
  };
}

jest.unstable_mockModule("../../controllers/rating/customer.controller.js", () => ({
  RatingCustomerController: class {
    createRating = mkController("customer.createRating");
    updateRatingByOwner = mkController("customer.updateRatingByOwner");
    listMyRatings = mkController("customer.listMyRatings");
    getMyRatingById = mkController("customer.getMyRatingById");
  },
}));

jest.unstable_mockModule("../../controllers/rating/admin.controller.js", () => ({
  RatingAdminController: class {
    list = mkController("admin.list");
    changeStatus = mkController("admin.changeStatus");
    changeSellerReplyStatus = mkController("admin.changeSellerReplyStatus");
  },
}));

jest.unstable_mockModule("../../controllers/rating/helpful.controller.js", () => ({
  RatingHelpfulController: class {
    toggleVote = mkController("helpful.toggleVote");
  },
}));

jest.unstable_mockModule("../../controllers/rating/reply.controller.js", () => ({
  RatingReplyController: class {
    createSellerReply = mkController("reply.createSellerReply");
    updateSellerReply = mkController("reply.updateSellerReply");
    setSellerReplyVisibility = mkController("reply.setSellerReplyVisibility");
    softDeleteSellerReply = mkController("reply.softDeleteSellerReply");
    restoreSellerReply = mkController("reply.restoreSellerReply");
  },
}));

jest.unstable_mockModule("../../controllers/rating/seller.controller.js", () => ({
  RatingSellerController: class {
    listSellerRatings = mkController("seller.listSellerRatings");
    getSellerRatingsStats = mkController("seller.getSellerRatingsStats");
  },
}));

/** --- ייבוא הראוטר אחרי כל המוקים --- */
let ratingsRouterDefault;
beforeAll(async () => {
  ({ default: ratingsRouterDefault } = await import("../../router/ratings.router.js"));
});

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(ratingsRouterDefault);
  return app;
};

/** --- טבלאות מסלולים --- */
const cases = [
  // לקוח
  {
    name: "POST /ratings",
    method: "post",
    path: "/ratings",
    body: { productId: "p", stars: 5 },
    expectRoute: "customer.createRating",
    expectOrder: ["auth", "createRatingLimiter", "validate(body:createRatingSchema)"],
  },
  {
    name: "PATCH /ratings/:id",
    method: "patch",
    path: "/ratings/123",
    body: { text: "x" },
    expectRoute: "customer.updateRatingByOwner",
    expectOrder: ["auth", "editRatingLimiter", "validate(body:updateRatingSchema)"],
  },
  {
    name: "GET /me/ratings",
    method: "get",
    path: "/me/ratings?page=1",
    expectRoute: "customer.listMyRatings",
    expectOrder: ["auth", "validate(query:listMyRatingsQuerySchema)"],
  },
  {
    name: "GET /me/ratings/:id",
    method: "get",
    path: "/me/ratings/abc",
    expectRoute: "customer.getMyRatingById",
    expectOrder: ["auth", "validate(params:getMyRatingParamsSchema)"],
  },
  {
    name: "POST /ratings/:id/helpful",
    method: "post",
    path: "/ratings/xyz/helpful",
    body: { value: 1 },
    expectRoute: "helpful.toggleVote",
    expectOrder: ["auth", "helpfulLimiter", "validate(body:setHelpfulVoteSchema)"],
  },

  // מוכר
  {
    name: "GET /seller/ratings",
    method: "get",
    path: "/seller/ratings?sort=new",
    expectRoute: "seller.listSellerRatings",
    expectOrder: ["auth", "isSeller", "validate(query:listSellerRatingsQuerySchema)"],
  },
  {
    name: "GET /seller/ratings/stats",
    method: "get",
    path: "/seller/ratings/stats",
    expectRoute: "seller.getSellerRatingsStats",
    expectOrder: ["auth", "isSeller", "validate(query:sellerRatingsStatsQuerySchema)"],
  },
  {
    name: "POST /seller/ratings/:id/reply",
    method: "post",
    path: "/seller/ratings/1/reply",
    body: { text: "hi" },
    expectRoute: "reply.createSellerReply",
    expectOrder: ["auth", "isSeller", "sellerReplyLimiter", "validate(body:createSellerReplySchema)"],
  },
  {
    name: "PATCH /seller/ratings/:id/reply",
    method: "patch",
    path: "/seller/ratings/1/reply",
    body: { text: "upd" },
    expectRoute: "reply.updateSellerReply",
    expectOrder: ["auth", "isSeller", "sellerReplyLimiter", "validate(body:updateSellerReplySchema)"],
  },
  {
    name: "PATCH /seller/ratings/:id/reply/visibility",
    method: "patch",
    path: "/seller/ratings/1/reply/visibility",
    body: { visible: true },
    expectRoute: "reply.setSellerReplyVisibility",
    expectOrder: ["auth", "isSeller", "sellerReplyLimiter", "validate(body:sellerReplyVisibilitySchema)"],
  },
  {
    name: "DELETE /seller/ratings/:id/reply",
    method: "delete",
    path: "/seller/ratings/1/reply",
    expectRoute: "reply.softDeleteSellerReply",
    expectOrder: ["auth", "isSeller", "sellerReplyLimiter"],
  },
  {
    name: "POST /seller/ratings/:id/reply/restore",
    method: "post",
    path: "/seller/ratings/1/reply/restore",
    expectRoute: "reply.restoreSellerReply",
    expectOrder: ["auth", "isSeller", "sellerReplyLimiter"],
  },

  // אדמין
  {
    name: "GET /admin/ratings",
    method: "get",
    path: "/admin/ratings",
    expectRoute: "admin.list",
    expectOrder: ["auth", "requireRoles(admin)"],
  },
  {
    name: "PATCH /admin/ratings/:id/status",
    method: "patch",
    path: "/admin/ratings/7/status",
    body: { status: "approved" },
    expectRoute: "admin.changeStatus",
    expectOrder: ["auth", "requireRoles(admin)"],
  },
  {
    name: "PATCH /admin/ratings/:id/seller-reply/status",
    method: "patch",
    path: "/admin/ratings/7/seller-reply/status",
    body: { status: "approved" },
    expectRoute: "admin.changeSellerReplyStatus",
    expectOrder: ["auth", "requireRoles(admin)"],
  },
];

describe("ratings router wiring", () => {
  test.each(cases)("%s", async ({ method, path, body, expectRoute, expectOrder }) => {
    const app = buildApp();
    const res = await request(app)[method](path).send(body || {}).expect(200);
    const { route, order } = res.body;

    expect(route).toBe(expectRoute);
    // וידוא סדר המידלוורים לפני הקונטרולר
    expect(order.slice(0, expectOrder.length)).toEqual(expectOrder);
  });

  test("requireRoles called with 'admin' on admin routes", async () => {
    requiredRolesSeen.length = 0;
    const app = buildApp();
    await request(app).get("/admin/ratings");
    await request(app).patch("/admin/ratings/1/status");
    await request(app).patch("/admin/ratings/1/seller-reply/status");
    // כל קריאה צריכה לכלול את 'admin'
    requiredRolesSeen.forEach(args => expect(args).toContain("admin"));
  });
});
