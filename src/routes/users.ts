import express from "express";
import { checkJwt } from "../middleware/checkJwt";
import { asyncHandler } from "../middleware/asyncHandler";
import { UserController, TodoListController } from "./../controllers/index";

const userRouter = express.Router();

userRouter.get("/:userId/check-auth", [checkJwt], asyncHandler(UserController.checkAuth));

userRouter.get(
	"/:userId",
	[checkJwt],
	asyncHandler(UserController.getUserDetails)
);

userRouter.get(
	"/:userId/todoLists",
	[checkJwt],
	asyncHandler(TodoListController.getTodoLists)
);

// Update Password
userRouter.put(
	"/:userId",
	[checkJwt],
	asyncHandler(UserController.updatePassword)
);

userRouter.delete(
	"/:userId",
	[checkJwt],
	asyncHandler(UserController.deleteUser)
);

userRouter.delete(
	"/:userId/logout",
	[checkJwt],
	asyncHandler(UserController.logoutUser)
);

export default userRouter;
