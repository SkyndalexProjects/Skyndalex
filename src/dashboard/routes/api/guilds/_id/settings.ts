import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { requireGuildPermission } from "../../../../middleware/auth.js";

type SettingsPayload = Record<string, unknown>;
export default async function guildSettingsRoute(fastify: FastifyInstance) {
	fastify.post(
		"/settings",
		{ preHandler: requireGuildPermission },
		async (
			request: FastifyRequest<{
				Params: { id: string };
				Body: SettingsPayload;
			}>,
			reply: FastifyReply,
		) => {
			const guildId = request.params.id
			if (
				typeof request.body !== "object" ||
				request.body === null ||
				Array.isArray(request.body)
			) {
				return reply.code(400).send({ error: "Invalid body" });
			}

			const {
				guildId: _ignoredGuildId,
				id: _ignoredId,
				...safeBody
			} = request.body;

			if (safeBody.error) {
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
		{ preHandler: requireGuildPermission },
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			const guildId = request.params.id

			const settings = await request.client.prisma.settings.findUnique({
				where: { guildId },
			});

			console.log("Fetched settings for guild:", guildId, settings);

			if (!settings) return reply.send({});
			return reply.send(settings);
		},
	);
}
