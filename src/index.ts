import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import userRouter from "./routes/users";
import taskRouter from "./routes/tasks";
import express, { Request, Response, Application, NextFunction } from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import bodyParser from "body-parser";

const saltRounds = 10;
const generateToken = async (userId: number) => {
	return await bcrypt.hash(
		jwt.sign({ userId }, SECRET_KEY, { expiresIn: "6h" }),
		saltRounds
	);
};
const server: Application = express();
const prisma = new PrismaClient();
const SECRET_KEY = String(process.env.SECRET_KEY);
server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

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
			return;
		}
		const decoded: any = jwt.verify(token, SECRET_KEY);
		let user = await prisma.user.findUnique({
			where: { id: decoded.userId },
		});
		if (!user) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		// @ts-ignore
		req.user = user;
		next();
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
}

server.post("/users/register", async function (req, res) {
	try {
		const { email, password }: any = req.body;
		bcrypt.hash(password, saltRounds, async (err, hash) => {
			if (err) {
				res.status(500).json({ message: "Error Creating User" });
				return;
			}
			const userDetails = await prisma.user.create({
				data: {
					email,
					password: hash,
				},
			});
			const token = await generateToken(userDetails.id);

			// Save the session in the database
			const sessionDetails = await prisma.session.create({
				data: {
					userId: userDetails.id,
					token,
				},
			});
			res.status(201).json({
				message: "User Created Successfully",
				data: {
					userId: sessionDetails.userId,
					token: sessionDetails.token,
				},
			});
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

server.post("/users/login", async function (req, res) {
	try {
		const { email, password }: any = req.body;

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user || !bcrypt.compare(password, user.password)) {
			res.status(401).json({ error: "Invalid credentials" });
		} else {
			// Generate a JWT token with user ID
			const token = await generateToken(user.id);

			// Save the session in the database
			await prisma.session.create({
				data: {
					userId: user.id,
					token,
				},
			});
			res.cookie("token", token, { httpOnly: true });
			res.status(200).json({ message: "Login successful" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

server.use("/tasks", authMiddleware, taskRouter);
server.use("/users", authMiddleware, userRouter);

server.listen(Number(process.env.PORT), () => {
	console.log(`App is listening on port ${process.env.PORT}`);
});
