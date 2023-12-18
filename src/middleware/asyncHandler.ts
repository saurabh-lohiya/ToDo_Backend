import { NextFunction, Request, Response } from "express";
import { CustomRequest } from "./checkJwt";

export const asyncHandler =
	(fn: (req: CustomRequest, res: Response, next: NextFunction) => void) =>
	(req: Request, res: Response, next: NextFunction) => {
		return Promise.resolve(fn(req, res, next)).catch(next);
	};
