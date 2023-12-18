import crypto from "crypto";
require("dotenv").config();

const config = {
	client_url: process.env.CLIENT_URL || "",
	env: process.env.NODE_ENV || "development",
	jwt: {
		secret: process.env.JWT_SECRET as string,
		audience: process.env.JWT_AUDIENCE,
		issuer: process.env.JWT_ISSUER,
		expiresIn: process.env.JWT_EXPIRES_IN,
	},
	bcrypt: {
		saltRounds: Number(process.env.SALT_ROUNDS) || 10,
	},
	crypto: {
		algorithm: process.env.ENCR_ALGORITHM || "",
		secretKey: process.env.ENCRYPTION_KEY || "",
		iv: crypto.randomBytes(16),
	},
	port: Number(process.env.PORT) || 8080,
	db: {
		db_url: process.env.DB_URL,
	},
};

export default config;
