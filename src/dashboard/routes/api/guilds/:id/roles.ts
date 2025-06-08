import { ChannelType } from "discord.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

export default async function guildRolesRoute(fastify: FastifyInstance) {
	fastify.post(
		"/roles",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			console.log("[Server] :: Roles requested");
			const getId = request.client.guilds.cache.get(request.params.id)?.id;
			if (!getId) {
				reply.status(404).send({ error: "Guild not found" });
				return;
			}

			const getRoles = Array.from(
				request.client.guilds.cache.get(getId)?.roles.cache.values() || [],
			).map((role) => {
				return {
					id: role.id,
					name: role.name,
					color: role.color,
					permissions: role.permissions.bitfield.toString(),
					position: role.position,
					managed: role.managed,
					mentionable: role.mentionable,
					guildId: getId,
				};
			});

			if (getRoles.length <= 0) {
				reply.status(404).send({ error: "Roles not found" });
				return;
			}

			return getRoles;
		},
	);
}
