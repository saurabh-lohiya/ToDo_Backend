import express from "express";
import { AuthController } from "../controllers";
import { asyncHandler } from "../middleware/asyncHandler";

const authRouter = express.Router();

authRouter.post("/register", asyncHandler(AuthController.registerNewUser));
authRouter.post("/login", asyncHandler(AuthController.loginUser));

export default authRouter;
