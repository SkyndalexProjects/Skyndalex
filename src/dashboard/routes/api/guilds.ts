import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import * as console from "node:console";
import { auth } from "../../../auth.js";
import type { DiscordUser } from "#types";

interface Guild {
	id: string;
	name: string;
	icon?: string;
	owner: boolean;
	permissions: string;
}

export default async function guildsRoute(fastify: FastifyInstance) {
	fastify.get(
		"/guilds",
		async (request: FastifyRequest, reply: FastifyReply) => {
			const session = await auth.api.getSession({ headers: request.headers });

			if (!session) {
				reply.status(401).send({ error: "Unauthorized" });
				return;
			}

			const { accessToken } = await auth.api.getAccessToken({
				body: {
					providerId: "discord",
					userId: session.session.userId,
				},
				headers: request.headers,
			});
			const response = await fetch("https://discord.com/api/users/@me/guilds", {
				headers: {
					authorization: `Bearer ${accessToken}`,
				},
			});
			if (!response.ok) {
				reply.status(response.status).send({
					error: "Failed to fetch guilds",
				});
				return;
			}

			const guildsAPI = await response.json();

			if (!Array.isArray(guildsAPI)) {
				return reply.status(500).send({ error: "Invalid guilds response" });
			}

			const detailedGuilds = guildsAPI.map((guild: Guild) => ({
				...guild,
				isBotAdded: request.client.guilds.cache.has(guild.id),
				approximate_member_count:
					request.client.guilds.cache.get(guild.id)?.memberCount || 0,
			}));

			return reply.status(200).send(detailedGuilds);
		},
	);
	fastify.get(
		`/guild`,
		async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				console.log("[Server] :: Guild requested");
				const guildId = request.headers.guildid as string | undefined;

				const session = await auth.api.getSession({
					headers: request.headers,
				});

				if (!session) {
					reply.status(401).send({ error: "Unauthorized" });
					return;
				}

				if (!guildId) {
					reply.status(400).send({ error: "No guildId" });
					return;
				}

				const guild = request.client.guilds.cache.get(guildId);

				if (!guild) {
					reply.status(404).send({ error: "Guild not found" });
					return;
				}

				// @ts-ignore
				const member = await guild.members.fetch(session.user.discordId);

				if (!member?.permissions.has("ManageGuild")) {
					return reply.status(403).send({ error: "Forbidden" });
				}

				return reply.send(guild);
			} catch (error) {
				console.error("Error fetching guild:", error);
				reply.status(500).send({ error: "Internal server error" });
				return;
			}
		},
	);
}
