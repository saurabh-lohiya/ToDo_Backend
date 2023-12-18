import { PrismaClient } from "@prisma/client";

export class BaseController {
	prisma: any;
	constructor() {
		this.prisma = new PrismaClient();
	}
}
