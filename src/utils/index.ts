import crypto from "crypto";
import config from "../config";

export function encrypt(data: string) {
	const key = crypto.scryptSync(config.crypto.secretKey, "salt", 32); // for aes-256-cbc

	const cipher = crypto.createCipheriv(
		config.crypto.algorithm,
		Buffer.from(key),
		config.crypto.iv
	);
	const encryptedToken = Buffer.concat([
		cipher.update(data, "utf-8"),
		cipher.final(),
	]).toString("hex");
	return config.crypto.iv.toString("hex") + ":" + encryptedToken;
}

// Function to decrypt data
export function decrypt(encryptedData: string) {
	const token = encryptedData.split(" ")[1];
	const [iv, encryptedToken] = token.split(":");
	const key = crypto.scryptSync(config.crypto.secretKey, "salt", 32);
	const decipher = crypto.createDecipheriv(
		config.crypto.algorithm,
		Buffer.from(key),
		Buffer.from(iv, "hex")
	);
	const decrypted = Buffer.concat([
		decipher.update(Buffer.from(encryptedToken, "hex")),
		decipher.final(),
	]);
	return decrypted.toString();
}
