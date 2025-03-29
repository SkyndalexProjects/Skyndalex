import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

export default async function manageLogs(fastify: FastifyInstance) {
	fastify.post(
		"/logs",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			const getId = request.params.id;

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
