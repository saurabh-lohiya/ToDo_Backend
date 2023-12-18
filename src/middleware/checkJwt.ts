import { Request, Response, NextFunction } from "express";
import { verify, JwtPayload } from "jsonwebtoken";
import config from "../config";
import { decrypt } from "../utils";

export interface CustomRequest extends Request {
	token?: JwtPayload;
}

export const checkJwt = (
	req: CustomRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		console.log("Checking JWT");
		const token = req.cookies.token;
		const decryptedToken = decrypt(token);
		let jwtPayload = <any>verify(decryptedToken, config.jwt.secret, {
			complete: true,
			audience: config.jwt.audience,
			issuer: config.jwt.issuer,
			algorithms: ["HS256"],
			clockTolerance: 0,
			ignoreExpiration: false,
			ignoreNotBefore: false,
		});
		// Add the payload to the request so controllers may access it.
		req.token = jwtPayload;
		next();
	} catch (error) {
		console.error("Error checking JWT:", error);
		res.status(401).json({ message: "Missing or Invalid Token" });
		return;
	}
};
