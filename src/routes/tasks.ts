import express from "express";
import { authMiddleware } from "..";
import { PrismaClient } from "@prisma/client";

export const taskRouter = express.Router();
const prisma = new PrismaClient();
taskRouter.use("/tasks", authMiddleware);

taskRouter.post("/", async (req, res) => {
	try {
		const { title, description, status, start_date, end_date, subtasks }: any =
			req.body;
		console.log(req);
		// @ts-ignore
		if (!req.user) {
			return res.json({ message: "Failed Authentication" });
		}
		const newTask = await prisma.task.create({
			data: {
				title,
				description,
				status,
				start_date,
				end_date,
				// @ts-ignore
				userId: req.user.id,
				subtasks,
			},
		});
		res.json(newTask);
	} catch (error) {
		console.error("Error creating task:", error);
		res.status(500).json({ error: "Error creating task" });
	}
});

// Read a specific task by ID
taskRouter.get("/:taskId", async (req, res) => {
	const taskId = parseInt(req.params?.taskId, 10);
	try {
		const task = await prisma.task.findUnique({
			where: { id: taskId },
		});
		if (task) {
			res.json(task);
		} else {
			res.status(404).json({ error: "Task not found" });
		}
	} catch (error) {
		console.error("Error retrieving task:", error);
		res.status(500).json({ error: "Error retrieving task" });
	}
});

// Update a task by ID
taskRouter.put("/:taskId", authMiddleware, async (req, res) => {
	const taskId = parseInt(req.params?.taskId, 10);
	const { title, description, status, start_date, end_date, subtasks }: any =
		req.body;
	try {
		const updatedTask = await prisma.task.update({
			where: { id: taskId },
			data: {
				title,
				description,
				status,
				start_date,
				end_date,
				subtasks,
			},
		});
		res.json(updatedTask);
	} catch (error) {
		console.error("Error updating task:", error);
		res.status(500).json({ error: "Error updating task" });
	}
});

// Delete a task by ID
taskRouter.delete("/:taskId", authMiddleware, async (req, res) => {
	const taskId = parseInt(req.params?.taskId, 10);
	try {
		await prisma.task.delete({
			where: { id: taskId },
		});
		res.json({ message: "Task deleted successfully" });
	} catch (error) {
		console.error("Error deleting task:", error);
		res.status(500).json({ error: "Error deleting task" });
	}
});
