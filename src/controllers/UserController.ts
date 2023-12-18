import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { ClientError, UnauthorizedError } from "../exceptions/";
import { BaseController } from "./index";
import { CustomRequest } from "../middleware/checkJwt";
import config from "../config";
import { PrismaClient } from "@prisma/client";

export class UserController extends BaseController {
	static prisma = new PrismaClient();
	constructor() {
		super();
	}

	static async checkAuth(
		req: CustomRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.token) {
				res.status(200).json({ message: "User is authenticated" });
			}
		} catch (error) {
			console.error("Error checking JWT:", error);
			res.status(401).json({ message: "Missing or Invalid Token" });
			return;
		}
	}

	static async getUserDetails(req: Request, res: Response, next: NextFunction) {
		const userId: number = Number(req.params.userId);
		const user = await UserController.prisma.user.findUnique({
			where: { id: userId },
			include: {
				todoLists: true,
			},
		});
		if (!user) {
			throw new UnauthorizedError("Invalid Credentials");
		}
		const { password: _, ...userWithoutPassword } = user;
		res.status(200).json({
			message: "User Details Fetched Successfully",
			data: userWithoutPassword,
		});
	}

	static async editUserDetails(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const userId: number = Number(req.params.userId);
		const user = await UserController.prisma.user.findUnique({
			where: { id: userId },
		});
		if (!user) {
			throw new UnauthorizedError("Invalid Credentials");
		}
		// update the user details here
		const {
			user_name,
			email,
			first_name,
			last_name,
			birth_date,
			phone_number,
		} = req.body;
		const updatedUser = await UserController.prisma.user.update({
			where: { id: userId },
			data: {
				user_name,
				email,
				first_name,
				last_name,
				birth_date,
				phone_number,
			},
		});
		if (updatedUser) {
			res.status(200).json({ message: "User Details Updated Successfully" });
		}
	}

	static async deleteUser(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const userId: number = Number(req.params.userId);
		// delete the user here
		const deletedUser = await UserController.prisma.user.delete({
			where: { id: userId },
		});
		if (deletedUser) {
			res.status(204).json({ message: "User Deleted Successfully" });
		}
	}

	static async logoutUser(
		req: CustomRequest,
		res: Response,
		next: NextFunction
	): Promise<void> {
		// Delete session from the database
		const logoutRes = await UserController.prisma.session.deleteMany({
			where: { userId: req.token?.payload.userId },
		});
		if (!logoutRes) {
			throw new ClientError("Error logging out user");
		}
		res.clearCookie("token");
		res.status(204).json({ message: "User Logged Out Successfully" });
	}

	static async updatePassword(
		req: CustomRequest,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const userId = req.token?.payload.userId;
		const { email, oldPassword, newPassword }: any = req.body;
		const user = await UserController.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user || !bcrypt.compare(oldPassword, user.password)) {
			throw new UnauthorizedError("Incorrect Password");
		}
		const hashedPassword = await bcrypt.hash(
			newPassword,
			config.bcrypt.saltRounds
		);

		const updatedUser = await UserController.prisma.user.update({
			where: { id: userId },
			data: {
				email,
				password: hashedPassword,
			},
		});
		if (!updatedUser) {
			res.status(500).json({ error: "Error updating user" });
			return;
		}
		res.status(200).json({ message: "Password updated successfully" });
		next();
	}
}

export default UserController;
