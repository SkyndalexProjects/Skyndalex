import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

interface Guild {
	id: string;
	name: string;
	icon: string;
	owner: boolean;
	permissions: string;
}

export default async function guildSettingsRoute(fastify: FastifyInstance) {
	fastify.post(
		"/settings",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			console.log("[Server] :: Settings requested");
			const getId = request.client.guilds.cache.get(request.params.id)?.id;
			if (!getId) {
				reply.status(404).send({ error: "Guild not found" });
				return;
			}

			const getSettings = await request.client.prisma.settings.findMany({
				where: {
					guildId: getId,
				},
			});

			return getSettings;
		},
	);
}
