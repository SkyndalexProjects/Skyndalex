import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

async function userRoutes(fastify: FastifyInstance) {
	fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
		const token = request.cookies.token;
		console.log("[Server] :: User requested");

		console.log("token", token);
		const response = await fetch("https://discord.com/api/users/@me", {
			headers: {
				authorization: `Bearer ${token}`,
			},
		});

		const user = await response.json();
		console.log("user", user);
		reply.send(user);
	});
}

export default userRoutes;
