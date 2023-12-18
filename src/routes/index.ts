import { Router } from "express";
import userRouter from "./users";
import taskRouter from "./tasks";
import authRouter from "./authRouter";

const routes = Router();
routes.use("/auth", authRouter);
routes.use("/users", userRouter);
routes.use("/todo-lists", taskRouter);
// Handle 404 Routes
routes.use("*", (req, res) => {

    console.log(req.originalUrl)
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
export default routes;
