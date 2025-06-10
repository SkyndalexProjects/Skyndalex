import { ChannelType } from "discord.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { REPL_MODE_SLOPPY } from "repl";

export default async function userInfo(fastify: FastifyInstance) {
	fastify.post(
		"/info",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			console.log("[Server] :: User info requested");
			const getId = request.params.id;

			const getUser = await request.client.prisma.users.findMany({
				where: {
					userId: getId,
				},
			});

			console.log("[Server] :: User info requested", getUser);
			if (!getUser) {
				return reply.status(404).send({ message: "User not found" });
			}

			reply.send(getUser);
		},
	);
}
