import Fastify from "fastify";
import type { Guild } from "discord.js";

const fastify = Fastify();

fastify.get("/", (req, res) => {
	const token = req.cookies.token;

	if (!token) return res.redirect(process.env.OAUTH_URL);
});

export default fastify;
