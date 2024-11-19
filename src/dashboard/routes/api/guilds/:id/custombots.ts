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
		"/custombots",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			console.log("[Server] :: Settings requested");
			const getId = request.params.id;

			const getCustombots = await request.client.prisma.custombots.findMany({
				where: {
					guildId: getId,
				},
			});

			console.log("getCustombots", getCustombots);

			// Get body from request
			const body = request.body;
			console.log("body", body);
			return getCustombots;
		},
	);
}
