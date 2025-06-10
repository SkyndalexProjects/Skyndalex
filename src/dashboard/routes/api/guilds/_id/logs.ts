import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

export default async function manageLogs(fastify: FastifyInstance) {
	fastify.post(
		"/logs",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			const getId = request.client.guilds.cache.get(request.params.id)?.id;

			if (!getId) {
				return reply.status(404).send({
					message: "Guild not found",
					status: 404,
				});
			}

			const getLogs = await request.client.prisma.dashboardLogs.findMany({
				where: {
					guildId: getId,
				},
			});
			console.log("[Server] :: Logs requested");

			return getLogs;
		},
	);
}
