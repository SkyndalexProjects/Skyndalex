import { Router, Request, Response } from "express";
import type { Guild } from "discord.js";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const token = req.cookies.token;
	console.log("headers", token);
	console.log("[Server] :: Guilds requested");

	const response = await fetch("https://discord.com/api/users/@me/guilds", {
		headers: {
			authorization: `Bearer ${token}`,
		},
	});

	const guilds = (await response.json()) as Guild[];
	const filteredGuilds = guilds.filter(guild => {
		const permissions = BigInt(guild.permissions);
		const hasPermission = (permissions & BigInt(0x20)) === BigInt(0x20);
		return hasPermission;
	});
	res.send(filteredGuilds);
	return;
});

export default router;
