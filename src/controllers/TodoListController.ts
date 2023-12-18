import { Response, NextFunction } from "express";
import { BaseController } from "./index";
import { CustomRequest } from "../middleware/checkJwt";
import { NotFoundError } from "../exceptions";
import { PrismaClient } from "@prisma/client";

export class TodoListController extends BaseController {
	static prisma = new PrismaClient();
	constructor() {
		super();
	}
	static async createTodoList(
		req: CustomRequest,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const { title, description, status, start_date, end_date, tasks } =
			req.body;
		const userId = req.token?.payload.userId;
		try {
			const todoList = await TodoListController.prisma.todoList.create({
				data: {
					title,
					description,
					status,
					userId,
					start_date,
					end_date,
					tasks,
				},
			});
			res.status(201).json(todoList);
			next();
		} catch (error) {
			console.error("Error creating task:", error);
			res.status(500).json({ error: "Error creating task" });
			next();
		}
	}

	static async getTodoLists(
		req: CustomRequest,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const userId = req.token?.payload.userId;
			const todoLists = await TodoListController.prisma.todoList.findMany({
				where: { userId },
			});
			res.status(200).json({ data: todoLists });
			next();
		} catch (error) {
			console.error("Error retrieving tasks:", error);
			res.status(500).json({ error: "Error retrieving tasks" });
			next();
		}
	}

	static async getTodoListById(
		req: CustomRequest,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const todoListId = parseInt(req.params?.id);
			const todoList = await TodoListController.prisma.todoList.findUnique({
				where: { id: todoListId },
			});
			if (todoList) {
				res.status(200).json(todoList);
			} else {
				throw new NotFoundError("TodoList not found");
			}
		} catch (error) {
			console.error("Error retrieving task:", error);
			res.status(500).json({ error: "Error retrieving task" });
			next();
		}
	}

	static async updateTodoListById(
		req: CustomRequest,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const todoListId = parseInt(req.params.id);
			const { title, description, status, start_date, end_date, tasks }: any =
				req.body;
			const updatedTodoList = await TodoListController.prisma.todoList.update({
				where: { id: todoListId },
				data: {
					title,
					description,
					status,
					start_date,
					end_date,
					tasks,
				},
			});
			res.status(200).json(updatedTodoList);
		} catch (error) {
			console.error("Error updating task:", error);
			res.status(500).json({ error: "Error updating task" });
			next();
		}
	}

	static async deleteTodoListById(
		req: CustomRequest,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const todoListId = parseInt(req.params?.id);
			await TodoListController.prisma.todoList.delete({
				where: { id: todoListId },
			});
			res.status(204).json({ message: "Task deleted successfully" });
			return;
		} catch (error) {
			console.error("Error deleting task:", error);
			res.status(500).json({ error: "Error deleting task" });
			return;
		}
	}
}

export default TodoListController;
