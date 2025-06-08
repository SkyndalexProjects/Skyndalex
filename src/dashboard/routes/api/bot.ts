import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default async function userRoutes(fastify: FastifyInstance) {
	fastify.get("/bot", async (request: FastifyRequest, reply: FastifyReply) => {
		const token = request.headers.authorization;
		console.log("[Server] :: Bot requested");

		const response = await fetch("https://discord.com/api/users/@me", {
			headers: {
				"Content-Type": "application/json",
				...(token ? { Authorization: token } : {}),
			},
		});

		const bot = await response.json();

		console.log("[Server] :: Bot fetched");
		reply.send(bot);
	});
	fastify.get(
		"/bot/rpc",
		async (request: FastifyRequest, reply: FastifyReply) => {
			const clientID = request.headers.clientid;
			console.log("[Server] :: Bot RPC requested");

			const response = await fetch(
				`https://discord.com/api/applications/${clientID}/rpc`,
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			const rpc = await response.json();
			reply.send(rpc);
		},
	);
}
