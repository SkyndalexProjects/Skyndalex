import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../../auth.js";
import type { DiscordUser } from "#types";
export default async function userRoutes(fastify: FastifyInstance) {
	fastify.get("/user", async (request: FastifyRequest, reply: FastifyReply) => {
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session) {
			reply.status(401).send({ error: "Unauthorized" });
			return;
		}

		const { accessToken } = await auth.api.getAccessToken({
			body: {
				providerId: "discord",
				userId: session.session.userId,
			},
			headers: request.headers,
		});
		const response = await fetch("https://discord.com/api/users/@me", {
			headers: {
				authorization: `Bearer ${accessToken}`,
			},
		});

		const user = (await response.json()) as DiscordUser;

		console.log("user", user);
		reply.send(user);
	});
}
