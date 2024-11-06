import { Router, Request, Response } from "express";
import { DiscordOauthResponse } from "#types";
import type { Guild } from "discord.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	console.log("req.session", req.session);
	const token = req.session?.user?.accessToken;
	console.log("token", token);
	console.log("[Server] :: Guilds requested");

	const response = await fetch("https://discord.com/api/users/@me/guilds", {
		headers: {
			authorization: `Bearer ${req.cookies.token}`,
		},
	});

	const guilds = (await response.json()) as Guild[];
	res.send(guilds);
	return;
});

export default router;
