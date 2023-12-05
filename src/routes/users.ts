import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "..";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userRouter = express.Router();
const prisma = new PrismaClient();
const saltRounds = 10;
const SECRET_KEY = String(process.env.SECRET_KEY);

const generateToken = (userId: number) => {
	return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "6h" });
};

userRouter.use("/users");

userRouter.post("/", async (req, res) => {
	try {
		console.log("hi");
		const { email, password }: any = req.body;
		bcrypt.hash(password, saltRounds, async (err, hash) => {
			if (err) {
				res.status(500).json({ message: "Error Creating User" });
			}
			await prisma.user.create({
				data: {
					email,
					password: hash,
				},
			});
			res.redirect("/home");
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

userRouter.get("/:userId", authMiddleware, async (req, res) => {
	try {
		const userId = parseInt(req.params?.userId, 10);

		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			res.status(404).json({ error: "User not found" });
		} else {
			res.status(200).json(user);
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

userRouter.get("/:userId/tasks", authMiddleware, async (req, res) => {
	try {
		const tasks = await prisma.task.findMany({
			where: { userId: req.params.userId },
		});
		res.json(tasks);
	} catch (error) {
		console.error("Error retrieving tasks:", error);
		res.status(500).json({ error: "Error retrieving tasks" });
	}
});

// Update Password
userRouter.put("/:userId", authMiddleware, async (req, res) => {
	try {
		const userId = parseInt(req.params?.userId, 10);
		const { email, oldPassword, newPassword }: any = req.body;
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user || !bcrypt.compare(oldPassword, user.password)) {
			return res.status(401).json({ error: "Incorrect Password" });
		}
		const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				email,
				password: hashedPassword,
			},
		});
		//TODO: add logout logic here
		res.json(updatedUser);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

userRouter.delete("/:userId", authMiddleware, async (req, res) => {
	try {
		const userId = parseInt(req.params?.userId, 10);

		await prisma.user.delete({
			where: { id: userId },
		});

		res.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

userRouter.post("/login", async (req, res) => {
	try {
		const { email, password }: any = req.body;

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user || !bcrypt.compare(password, user.password)) {
			res.status(401).json({ error: "Invalid credentials" });
		} else {
			// Generate a JWT token with user ID
			const token = generateToken(user.id);

			// Save the session in the database
			await prisma.session.create({
				data: {
					userId: user.id,
					token,
				},
			});
			res.json({ message: "Login successful", token });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

userRouter.post("/:userId/logout", authMiddleware, async (req: any, res) => {
	try {
		const token = req.headers?.authorization;

		// Delete session from the database
		await prisma.session.deleteMany({
			where: { userId: req.user.id, token },
		});
		res.redirect("/");
	} catch (error) {
		console.error(error);
		res.status(401).json({ error: "Invalid or expired token" });
	}
});
