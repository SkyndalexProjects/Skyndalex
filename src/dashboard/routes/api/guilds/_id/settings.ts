import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

export default async function guildSettingsRoute(fastify: FastifyInstance) {
	fastify.post(
		"/settings",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			console.log("[Server] :: Settings requested");
		},
	);
}
