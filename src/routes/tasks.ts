import express from "express";
import { PrismaClient } from "@prisma/client";

const taskRouter = express.Router();
const prisma = new PrismaClient();

taskRouter.post("/", async function (req, res) {
	try {
		const { title, description, status, start_date, end_date, tasks }: any =
			req.body;
		console.log(req);
		// @ts-ignore
		if (!req.user) {
			return res.json({ message: "Failed Authentication" });
		}
		const newTask = await prisma.todoList.create({
			data: {
				title,
				description,
				status,
				start_date,
				end_date,
				userId: (req as any).user.id,
				tasks: [],
			},
		});
		res.json(newTask);
	} catch (error) {
		console.error("Error creating task:", error);
		res.status(500).json({ error: "Error creating task" });
	}
});

// Read a specific task by ID
taskRouter.get("/:taskId", async function (req, res) {
	try {
		const taskId = parseInt(req.params?.taskId, 10);
		const task = await prisma.todoList.findUnique({
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
taskRouter.put("/:taskId", async function (req, res) {
	try {
		const taskId = parseInt(req.params?.taskId, 10);
		const { title, description, status, start_date, end_date, tasks }: any =
			req.body;
		const updatedTask = await prisma.todoList.update({
			where: { id: taskId },
			data: {
				title,
				description,
				status,
				start_date,
				end_date,
				tasks: [],
			},
		});
		res.json(updatedTask);
	} catch (error) {
		console.error("Error updating task:", error);
		res.status(500).json({ error: "Error updating task" });
	}
});

// Delete a task by ID
taskRouter.delete("/:taskId", async function (req, res) {
	try {
		const taskId = parseInt(req.params?.taskId, 10);
		await prisma.todoList.delete({
			where: { id: taskId },
		});
		res.json({ message: "Task deleted successfully" });
	} catch (error) {
		console.error("Error deleting task:", error);
		res.status(500).json({ error: "Error deleting task" });
	}
});

export default taskRouter;
