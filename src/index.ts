import dotenv from "dotenv";
import { SkyndalexClient } from "#classes";

dotenv.config();

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
	throw new Error("BOT_TOKEN is not defined in the environment variables.");
}
new SkyndalexClient().init(botToken);
