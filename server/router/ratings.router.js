// routes/ratings.routes.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { RatingCustomerController } from "../controllers/rating/customer.controller.js";
import { RatingAdminController } from "../controllers/rating/admin.controller.js";
import { RatingHelpfulController } from "../controllers/rating/helpful.controller.js";
import { RatingReplyController } from "../controllers/rating/reply.controller.js"
import { RatingSellerController } from "../controllers/rating/seller.controller.js"
import { isSellerMiddleware } from "../middlewares/isSeller.middleware.js"
import { requireRoles } from "../middlewares/requireRoles.js"
import { validate } from "../middlewares/validate.js";
import { createRatingLimiter, editRatingLimiter, helpfulLimiter, sellerReplyLimiter } from "../middlewares/rateLimit.middleware.js";
import { createRatingSchema, updateRatingSchema, updateSellerReplySchema, listMyRatingsQuerySchema, getMyRatingParamsSchema, setHelpfulVoteSchema, listSellerRatingsQuerySchema, sellerRatingsStatsQuerySchema, createSellerReplySchema, sellerReplyVisibilitySchema } from "../validations/ratingSchemas.js";
export const ratingsRouter = express.Router();
const adminOnly = [authMiddleware, requireRoles("admin")];
const sellerOnly = [authMiddleware, isSellerMiddleware];
const ratingCustomerController = new RatingCustomerController()
const ratingAdminController = new RatingAdminController()
const ratingHelpfulController = new RatingHelpfulController()
const ratingReplyController = new RatingReplyController()
const ratingSellerController = new RatingSellerController()

//---------------לקוח---------------
ratingsRouter.post("/ratings", authMiddleware, createRatingLimiter, validate(createRatingSchema, "body"), ratingCustomerController.createRating);//יצירת ביקורת
ratingsRouter.patch("/ratings/:id", authMiddleware, editRatingLimiter, validate(updateRatingSchema, "body"), ratingCustomerController.updateRatingByOwner);//עריכה עד 6 שעות
ratingsRouter.get("/me/ratings", authMiddleware, validate(listMyRatingsQuerySchema, "query"), ratingCustomerController.listMyRatings);//הדרוגים שלי
ratingsRouter.get("/me/ratings/:id", authMiddleware, validate(getMyRatingParamsSchema, "params"), ratingCustomerController.getMyRatingById);//קבלת דירוג ספציפי
ratingsRouter.post("/ratings/:id/helpful", authMiddleware, helpfulLimiter, validate(setHelpfulVoteSchema, "body"), ratingHelpfulController.toggleVote);//הצבעה

//---------------מוכר---------------
ratingsRouter.get("/seller/ratings", ...sellerOnly, validate(listSellerRatingsQuerySchema, "query"), ratingSellerController.listSellerRatings);//רשימת דירוגים
ratingsRouter.get("/seller/ratings/stats", ...sellerOnly, validate(sellerRatingsStatsQuerySchema, "query"), ratingSellerController.getSellerRatingsStats);//סטטיסטיקות דירוגים
ratingsRouter.post("/seller/ratings/:id/reply", ...sellerOnly, sellerReplyLimiter, validate(createSellerReplySchema, "body"), ratingReplyController.createSellerReply);//תגובת מוכר
ratingsRouter.patch("/seller/ratings/:id/reply", ...sellerOnly, sellerReplyLimiter, validate(updateSellerReplySchema, "body"), ratingReplyController.updateSellerReply);//עדכון תגובת מוכר
ratingsRouter.patch("/seller/ratings/:id/reply/visibility", ...sellerOnly, sellerReplyLimiter, validate(sellerReplyVisibilitySchema, "body"), ratingReplyController.setSellerReplyVisibility);// שינוי חשיפה
ratingsRouter.delete("/seller/ratings/:id/reply", ...sellerOnly, sellerReplyLimiter, ratingReplyController.softDeleteSellerReply);// מחיקה רכה
ratingsRouter.post("/seller/ratings/:id/reply/restore", ...sellerOnly, sellerReplyLimiter, ratingReplyController.restoreSellerReply);//שחזור תגובה

//---------------אדמין---------------
ratingsRouter.get("/admin/ratings", ...adminOnly, ratingAdminController.list);//רשימת ביקורות
ratingsRouter.patch("/admin/ratings/:id/status", ...adminOnly, ratingAdminController.changeStatus);//שינוי סטטוס
ratingsRouter.patch("/admin/ratings/:id/seller-reply/status", ...adminOnly, ratingAdminController.changeSellerReplyStatus);//שינוי סטטוס תגובת מוכר

// ratingsRouter.delete("/admin/ratings/:id", ...adminOnly, ratingAdminController.deleteRating);//מחיקת תגובה
// ratingsRouter.post("/admin/ratings/:id/restore", ...adminOnly, ratingAdminController.restoreRating);//שחזור תגובה
// ratingsRouter.delete("/admin/ratings/:id/seller-reply", ...adminOnly, ratingAdminController.deleteSellerReply);//מחיקה רכה תגובת מוכר
// ratingsRouter.post("/admin/ratings/:id/seller-reply/restore", ...adminOnly, ratingAdminController.restoreSellerReply);//שחזור תגובת מוכר

//---------------פומבי למוצר---------------
//לעשות במוצר לא בדירוגים


//צריך גם שיוכלו לעדכן דירוג פוגעני

export default ratingsRouter;
