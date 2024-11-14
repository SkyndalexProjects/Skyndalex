import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default async function userRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/user",
		async (request: FastifyRequest, reply: FastifyReply) => {
			const token = request.cookies.token;
			console.log("[Server] :: User requested");

			const response = await fetch("https://discord.com/api/users/@me", {
				headers: {
					authorization: `Bearer ${token}`,
				},
			});

			const user = await response.json();

			reply.send(user);
		},
	);
}
