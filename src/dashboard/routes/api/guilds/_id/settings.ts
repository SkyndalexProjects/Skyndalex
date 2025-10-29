import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { auth } from "../../../../auth.js";

export default async function guildSettingsRoute(fastify: FastifyInstance) {
	fastify.post(
		"/settings",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			const getBody = request.body;
			const guildId = request.params.id;

			const result = await request.client.prisma.settings.upsert({
				where: { guildId: request.params.id },
				create: {
					guildId,
					...getBody,
				},
				update: {
					...getBody,
				},
			});
			return reply.send(result);
		},
	);
}
