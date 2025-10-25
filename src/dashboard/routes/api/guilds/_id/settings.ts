import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";


export default async function guildSettingsRoute(fastify: FastifyInstance) {
	fastify.post(
		"/settings",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
            const getBody = request.body;
            console.log("[Server] :: Guild settings update requested", getBody);

            const result = await request.client.prisma.settings.upsert({
                where: { guildId: request.params.id },
                create: {
                    guildId: request.params.id,
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
