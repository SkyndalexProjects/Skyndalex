import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default async function userRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/bot",
		async (request: FastifyRequest, reply: FastifyReply) => {
			const token = request.headers.authorization;
			console.log("[Server] :: Bot requested");

			const response = await fetch("https://discord.com/api/users/@me", {
				headers: {
                    "Content-Type": "application/json",
					Authorization: token,
				},
			});

			const bot = await response.json();

			reply.send(bot);
		},
	);
}
