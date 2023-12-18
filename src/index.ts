import express, { Request, Response, Application, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";
import config from "./config";
require("dotenv").config();

const server: Application = express();

server.use(
	cors({
		origin: config.client_url,
		credentials: true,
	})
);
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser());
server.use(routes);
server.use(errorHandler);

server.listen(Number(process.env.PORT), () => {
	console.log(`App is listening on port ${process.env.PORT}`);
});
