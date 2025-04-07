import { ChannelType } from "discord.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

export default async function guildSettingsRoute(fastify: FastifyInstance) {
	fastify.post(
		"/channels",
		{
			schema: {
				params: {
					type: "object",
					properties: {
						id: { type: "string", pattern: "^[0-9]+$" },
					},
					required: ["id"],
				},
				response: {
					200: {
						type: "array",
						items: {
							type: "object",
							properties: {
								id: { type: "string" },
								name: { type: "string" },
								type: { type: "string" },
								guildId: { type: "string" },
							},
							required: ["id", "name", "type", "guildId"],
						},
					},
					404: {
						type: "object",
						properties: {
							error: { type: "string" },
						},
					},
				},
			},
		},
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			console.log("[Server] :: Settings requested");
			const guild = request.client.guilds.cache.get(
				request.params.id,
			)?.id;

			if (!guild) {
				reply.status(404).send({ error: "Guild not found" });
				return;
			}

			const getChannels = request.client.guilds.cache
				.get(guild)
				?.channels.cache.map((ch) => {
					return {
						id: ch.id,
						name: ch.name,
						type: ChannelType[ch.type],
						guildId: guild,
					};
				});

			if (!getChannels || Array.from(getChannels).length === 0) {
				reply
					.status(404)
					.send({ error: "No channels found in the guild" });
				return;
			}

			if (!getChannels.every((ch) => ch.id && ch.name && ch.type)) {
				reply.status(500).send({ error: "Invalid channel data" });
				return;
			}

			return getChannels;
		},
	);
}
