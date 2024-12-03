import { ChannelType } from "discord.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

export default async function guildSettingsRoute(fastify: FastifyInstance) {
	fastify.post(
		"/channels",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			console.log("[Server] :: Settings requested");
			const getId = request.params.id;

			const getChannels = Array.from(
				request.client.guilds.cache
					.get(getId)
					?.channels.cache.values() || [],
			)
				.filter(
					(channel) =>
						channel.type === ChannelType.GuildText ||
						channel.type === ChannelType.GuildVoice,
				)
				.map((channel) => {
					return {
						id: channel.id,
						name: channel.name,
						type: channel.type,
						guildId: getId,
					};
				});
			if (!getChannels.length) {
				reply.status(404).send({ error: "Channels not found" });
				return;
			}

			return getChannels;
		},
	);
}
