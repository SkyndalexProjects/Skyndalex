import { ChannelType, PermissionFlagsBits } from "discord.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { auth } from "../../../../auth.js";
import type { DiscordUser } from "#types";

export default async function channels(fastify: FastifyInstance) {
	fastify.get(
		"/channels",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			console.log("[Server] :: Settings requested");
			const session = await auth.api.getSession({ headers: request.headers });

			const guildId = request.params.id;
			const guild = request.client.guilds.cache.get(guildId);

			const { accessToken } = await auth.api.getAccessToken({
				body: {
					providerId: "discord",
					userId: session?.session.userId,
				},
				headers: request.headers,
			});

			const response = await fetch("https://discord.com/api/users/@me", {
				headers: {
					authorization: `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				reply.status(response.status).send({
					error: "Failed to fetch user",
				});
				return;
			}

			const user = (await response.json()) as DiscordUser;
			const member = await guild.members.fetch(user.id);

			const getChannels = guild.channels.cache
				.filter((ch) => {
					const permissions = ch.permissionsFor(member);
					return (
						permissions && permissions.has(PermissionFlagsBits.ViewChannel)
					);
				})
				.map((ch) => {
					return {
						id: ch.id,
						name: ch.name,
						type: ChannelType[ch.type],
						guildId: guild.id,
					};
				});

			if (!getChannels || Array.from(getChannels).length === 0) {
				reply.status(404).send({ error: "No channels found in the guild" });
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
