import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

interface Guild {
	id: string;
	name: string;
	icon: string;
	owner: boolean;
	permissions: string;
}

export default async function manageCustombots(fastify: FastifyInstance) {
	fastify.post(
		"/custombots/get",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			const getId = request.params.id;

			const getCustombots = await request.client.prisma.custombots.findMany({
					where: {
						guildId: getId,
					},
				});
			console.log(
				"[Server] :: Settings (custombots get) requested",
				getCustombots,
			);
			return getCustombots;
		},
	);

	interface AddCustomBotBody {
		guildId: string;
		clientId: string;
		token: string;
		activity: string;
		status: string;
	}

	fastify.post(
		"/custombots/add",
		async (
			request: FastifyRequest<{ Body: AddCustomBotBody }>,
			reply: FastifyReply,
		) => {
			const body = request.body;
			const { guildId, clientId, token, activity, status } = body;
			const addCustombot = await request.client.prisma.custombots.create({
				data: {
					guildId,
					clientId,
					token,
					activity,
					status,
				},
			});

			console.log("[Server] :: Custombot added");
			return addCustombot;
		},
	);
}
