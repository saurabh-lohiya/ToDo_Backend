import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { ClientError, UnauthorizedError } from "../exceptions/";
import config from "../config";
import { BaseController } from "./index";
import { encrypt } from "../utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export class AuthController extends BaseController {
	constructor() {
		super();
	}

	static async registerNewUser(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const { email, password }: any = req.body;
		if (!email || !password) {
			throw new ClientError("Email or Password not provided");
		}
		const hash = await bcrypt.hash(password, config.bcrypt.saltRounds);

		const userDetails = await prisma.user.create({
			data: {
				email,
				password: hash,
			},
		});
		res.status(201).json({
			message: "User Created Successfully",
			data: {
				userId: userDetails.id,
			},
		});
		return;
	}

	static async loginUser(req: Request, res: Response, next: NextFunction) {
		const { email, password }: any = req.body;
		if (!email || !password) {
			throw new ClientError("Email or Password not provided");
		}
		const user = await prisma.user.findUnique({
			where: { email },
			include: {
				todoLists: true,
			},
		});
		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new UnauthorizedError("Invalid Credentials");
		}
		const { password: _, ...userWithoutPassword } = user;
		const token = sign({ userId: user.id }, config.jwt.secret, {
			audience: config.jwt.audience,
			issuer: config.jwt.issuer,
			expiresIn: config.jwt.expiresIn,
			algorithm: "HS256",
		});
		const encryptedToken = encrypt(token);
		res.cookie("token", `Bearer ${encryptedToken}`, {
			httpOnly: true,
			secure: config.env === "production",
			sameSite: "strict",
		});
		res.status(200).json({
			message: "User Logged In Successfully",
			data: {
				...userWithoutPassword,
				isAuthenticated: true,
			},
		});
		return;
	}
}
