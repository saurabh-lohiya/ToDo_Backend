import { Request, Response, NextFunction } from "express";
import { CustomError, IResponseError } from "../exceptions/customError";

export function errorHandler(
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) {
	console.log("------------------");
	console.error(err);
	console.log("------------------");
	if (!(err instanceof CustomError)) {
		err = new CustomError("Internal Server Error", 500);
	}
	const responseError: IResponseError = {
		message: err.message,
	};
	if (err.additionalInfo) {
		responseError.additionalInfo = err.additionalInfo;
	}
	res.status(err.status).json(responseError);
}
