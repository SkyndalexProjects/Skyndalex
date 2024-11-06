import { Router, Request, Response } from "express";
import { DiscordOauthResponse } from "#types";
import type { Guild } from "discord.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const token = req.cookies.token;
	console.log("[Server] :: User requested");

	console.log("token", token);
	const response = await fetch("https://discord.com/api/users/@me", {
		headers: {
			authorization: `Bearer ${req.cookies.token}`,
		},
	});

	const user = await response.json();
	console.log("user", user);
	res.send(user);
	return;
});

export default router;
