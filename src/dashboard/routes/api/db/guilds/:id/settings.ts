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
			const getId = request.params.id;

			const getSettings = await request.client.prisma.settings.findMany({
				where: {
					guildId: getId,
				},
			});

			console.log("getSettings", getSettings);

			return getSettings;
		},
	);
}
