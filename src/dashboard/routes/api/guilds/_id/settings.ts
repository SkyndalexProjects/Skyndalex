import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { auth } from "../../../../../auth.js";
import { PermissionFlagsBits } from "discord.js";

type SettingsPayload = Record<string, unknown>;
export default async function guildSettingsRoute(fastify: FastifyInstance) {
	fastify.post(
		"/settings",
		async (
			request: FastifyRequest<{
				Params: { id: string };
				Body: SettingsPayload;
			}>,
			reply: FastifyReply,
		) => {
			const guildId = request.params.id;
			if (
				typeof request.body !== "object" ||
				request.body === null ||
				Array.isArray(request.body)
			) {
				return reply.code(400).send({ error: "Invalid body" });
			}

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

			const {
				guildId: _ignoredGuildId,
				id: _ignoredId,
				...safeBody
			} = request.body;

			if (safeBody.error) {
				console.log("harnes is gay");
				return reply.code(400).send({ error: "Invalid body content" });
			}
			try {
				const result = await request.client.prisma.settings.upsert({
					where: { guildId },
					create: {
						...safeBody,
						guildId,
					},
					update: {
						...safeBody,
					},
				});
				return reply.send(result);
			} catch (e) {
				request.log.error(e);
				return reply.code(500).send({ error: "Failed to upsert settings" });
			}
		},
	);
	fastify.get(
		"/settings",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			const guildId = request.params.id;
			const session = await auth.api.getSession({
				headers: request.headers,
			});

			if (!session) {
				reply.status(401).send({ error: "Unauthorized" });
				return;
			}

			const guild = request.client.guilds.cache.get(guildId);

			if (!guild) {
				reply.status(404).send({ error: "Not found" });
				return;
			}
			// @ts-ignore
			const member = await guild.members.fetch(session?.user.discordId);
			if (!member) {
				reply.status(404).send({ error: "Not found." });
				return;
			}

			if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
				reply.status(403).send({ error: "Forbidden." });
				return;
			}

			const settings = await request.client.prisma.settings.findUnique({
				where: { guildId },
			});

			console.log("Fetched settings for guild:", guildId, settings);

			if (!settings) return reply.send({});
			return reply.send(settings);
		},
	);
}
