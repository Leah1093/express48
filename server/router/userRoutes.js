import express from "express";
import { UserController } from "../controllers/userController.js";
import { profileSchema , passwordSchema} from "../../client/src/components/validations/profileSchema.js";
import { validate } from "../middlewares/validate.js";
import { authCookieMiddleware } from "../middlewares/authCookieMiddleware.js";
const userRouter = express.Router();
const userController=new UserController();
userRouter.put("/update-profile", authCookieMiddleware, validate(profileSchema), userController.updateProfile);

export  {userRouter};
