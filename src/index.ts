import { SkyndalexClient } from "#classes";
import dotenv from "dotenv";
dotenv.config();

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
	throw new Error("BOT_TOKEN is not defined in the environment variables.");
}
new SkyndalexClient().init(botToken);
