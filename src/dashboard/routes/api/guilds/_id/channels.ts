import {
	ChannelType,
	GuildBasedChannel,
	PermissionFlagsBits,
} from "discord.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { requireGuildPermission } from "../../../../middleware/auth.js";

export default async function channels(fastify: FastifyInstance) {
	fastify.get(
		"/channels",
		{ preHandler: requireGuildPermission },
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			console.log("[Server] :: Channels requested");

			const { guild, member } = request;

			const getChannels = guild!.channels.cache
				.filter((ch: GuildBasedChannel) => {
					const permissions = ch.permissionsFor(member!);
					return permissions?.has(PermissionFlagsBits.ViewChannel);
				})
				.map((ch: GuildBasedChannel) => ({
					id: ch.id,
					name: ch.name,
					type: ChannelType[ch.type],
					guildId: guild!.id,
				}));
			if (!getChannels || getChannels.length === 0) {
				return reply
					.status(404)
					.send({ error: "No channels found in the guild" });
			}

			if (
				!getChannels.every(
					(ch: { id: string; name: string; type: string }) =>
						ch.id && ch.name && ch.type,
				)
			) {
				return reply.status(500).send({ error: "Invalid channel data" });
			}

			return getChannels;
		},
	);
}
