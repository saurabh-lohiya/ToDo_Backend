import express from "express";
import { checkJwt } from "../middleware/checkJwt";
import { asyncHandler } from "../middleware/asyncHandler";
import { TodoListController } from "../controllers";

const taskRouter = express.Router();

taskRouter.post(
	"/",
	[checkJwt],
	asyncHandler(TodoListController.createTodoList)
);

// Read a specific TodoList by ID
taskRouter.get(
	"/:id",
	[checkJwt],
	asyncHandler(TodoListController.getTodoListById)
);

// Update a todoList by ID
taskRouter.put(
	"/:id",
	[checkJwt],
	asyncHandler(TodoListController.updateTodoListById)
);

// Delete a task by ID
taskRouter.delete(
	"/:id",
	[checkJwt],
	asyncHandler(TodoListController.deleteTodoListById)
);

export default taskRouter;
