import { PrismaClient } from "@prisma/client";
import userRouter from "./routes/users";
import taskRouter from "./routes/tasks";
import express, { Request, Response, Application, NextFunction } from "express";
import jwt from "jsonwebtoken";

const server: Application = express();
const prisma = new PrismaClient();
const SECRET_KEY = String(process.env.SECRET_KEY);

// Middleware to authenticate requests
export async function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const token = req.headers?.authorization;

		if (!token) {
			res.status(401).json({ error: "Unauthorized" });
			throw new Error("Unauthorized");
		}
		const decoded: any = jwt.verify(token, SECRET_KEY);
		let user = await prisma.user.findUnique({
			where: { id: decoded.userId },
		});
		// @ts-ignore
		req.user = user;
		next();
	} catch (error) {
		console.error(error);
	}
}

server.use("/tasks", authMiddleware, taskRouter);
server.use("/users", userRouter);

server.listen(Number(process.env.PORT), () => {
	console.log(`App is listening on port ${process.env.PORT}`);
});
