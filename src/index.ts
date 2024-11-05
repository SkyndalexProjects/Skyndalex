import { SkyndalexClient } from "#classes";
import dotenv from "dotenv";
dotenv.config();

new SkyndalexClient().init(process.env.BOT_TOKEN);
