import console from "node:console";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function userRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/stats",
		async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				console.log("[/stats] Request started");
				const client = request.client;

				reply.send({
					cache: {
						guilds: client.guilds.cache.size,
						users: client.users.cache.size,
						channels: client.channels.cache.size,
						emojis: client.emojis.cache.size,
					},
				});
			} catch (error) {
				console.error("[/stats] CRITICAL ERROR:", error);
				reply.status(500).send({ error: "Failed to load stats" });
			}
		},
	);
}
