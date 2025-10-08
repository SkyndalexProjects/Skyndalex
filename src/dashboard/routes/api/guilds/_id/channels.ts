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

			if (!session) {
				reply.status(401).send({ error: "Unauthorized" });
				return;
			}

			const discordUserId = session.user?.id;

			if (!discordUserId) {
				reply.status(400).send({ error: "Session user id missing" });
				return;
			}

			const guild = request.client.guilds.cache.get(request.params.id);

			if (!guild) {
				reply.status(404).send({ error: "Not found" });
				return;
			}

			const { accessToken } = await auth.api.getAccessToken({
				body: {
					providerId: "discord",
					userId: session.session.userId,
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

			if (!member) {
				reply.status(404).send({ error: "Not found." });
			}

			if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
				reply.status(403).send({ error: "Forbidden." });
				return;
			}

			const getChannels = guild.channels.cache.map((ch) => {
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
