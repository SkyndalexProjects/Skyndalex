import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireGuildPermission } from "../../../../middleware/auth.js";

const equalizerPresets = [
	{
		id: "standard",
		name: "Standard",
		gains: [
			{ band: 0, gain: 0.0 },
			{ band: 1, gain: 0.0 },
			{ band: 2, gain: 0.0 },
			{ band: 3, gain: 0.0 },
			{ band: 4, gain: 0.0 },
			{ band: 5, gain: 0.0 },
			{ band: 6, gain: 0.0 },
			{ band: 7, gain: 0.0 },
			{ band: 8, gain: 0.0 },
			{ band: 9, gain: 0.0 },
			{ band: 10, gain: 0.0 },
			{ band: 11, gain: 0.0 },
			{ band: 12, gain: 0.0 },
			{ band: 13, gain: 0.0 },
			{ band: 14, gain: 0.0 },
		],
	},

	{
		id: "bass-boost",
		name: "Bass Boost",
		gains: [
			{ band: 0, gain: 0.12 },
			{ band: 1, gain: 0.12 },
			{ band: 2, gain: 0.1 },
			{ band: 3, gain: 0.08 },
			{ band: 4, gain: 0.05 },
			{ band: 5, gain: 0.02 },
			{ band: 6, gain: 0.0 },
			{ band: 7, gain: -0.02 },
			{ band: 8, gain: -0.03 },
			{ band: 9, gain: -0.04 },
			{ band: 10, gain: -0.05 },
			{ band: 11, gain: -0.05 },
			{ band: 12, gain: -0.04 },
			{ band: 13, gain: -0.03 },
			{ band: 14, gain: -0.02 },
		],
	},

	{
		id: "treble-boost",
		name: "Treble Boost",
		gains: [
			{ band: 0, gain: -0.05 },
			{ band: 1, gain: -0.05 },
			{ band: 2, gain: -0.04 },
			{ band: 3, gain: -0.02 },
			{ band: 4, gain: 0.0 },
			{ band: 5, gain: 0.02 },
			{ band: 6, gain: 0.04 },
			{ band: 7, gain: 0.06 },
			{ band: 8, gain: 0.08 },
			{ band: 9, gain: 0.1 },
			{ band: 10, gain: 0.11 },
			{ band: 11, gain: 0.12 },
			{ band: 12, gain: 0.12 },
			{ band: 13, gain: 0.1 },
			{ band: 14, gain: 0.08 },
		],
	},

	{
		id: "vocal",
		name: "Vocal",
		gains: [
			{ band: 0, gain: -0.08 },
			{ band: 1, gain: -0.06 },
			{ band: 2, gain: -0.04 },
			{ band: 3, gain: -0.02 },
			{ band: 4, gain: 0.02 },
			{ band: 5, gain: 0.05 },
			{ band: 6, gain: 0.09 },
			{ band: 7, gain: 0.11 },
			{ band: 8, gain: 0.12 },
			{ band: 9, gain: 0.1 },
			{ band: 10, gain: 0.08 },
			{ band: 11, gain: 0.05 },
			{ band: 12, gain: 0.02 },
			{ band: 13, gain: 0.0 },
			{ band: 14, gain: -0.02 },
		],
	},

	{
		id: "rock",
		name: "Rock",
		gains: [
			{ band: 0, gain: 0.08 },
			{ band: 1, gain: 0.1 },
			{ band: 2, gain: 0.08 },
			{ band: 3, gain: 0.04 },
			{ band: 4, gain: -0.02 },
			{ band: 5, gain: -0.04 },
			{ band: 6, gain: -0.03 },
			{ band: 7, gain: 0.02 },
			{ band: 8, gain: 0.06 },
			{ band: 9, gain: 0.09 },
			{ band: 10, gain: 0.11 },
			{ band: 11, gain: 0.1 },
			{ band: 12, gain: 0.08 },
			{ band: 13, gain: 0.06 },
			{ band: 14, gain: 0.05 },
		],
	},
];
type EqBand = { band: number; gain: number };
type PresetBody = { guildId: string; presetId: string };
type RadioPatchBody = {
	guildId: string;
	bands?: EqBand[];
	vibratoEnabled?: boolean;
};

const guildParamsSchema = {
	type: "object",
	additionalProperties: false,
	required: ["id"],
	properties: { id: { type: "string", minLength: 1 } },
} as const;

const presetBodySchema = {
	type: "object",
	additionalProperties: false,
	required: ["guildId", "presetId"],
	properties: {
		guildId: { type: "string", minLength: 1 },
		presetId: { type: "string", minLength: 1 },
	},
} as const;

const eqBodySchema = {
	type: "object",
	additionalProperties: false,
	required: ["guildId"],
	properties: {
		guildId: { type: "string", minLength: 1 },
		bands: {
			type: "array",
			minItems: 1,
			maxItems: 15,
			items: {
				type: "object",
				additionalProperties: false,
				required: ["band", "gain"],
				properties: {
					band: { type: "integer", minimum: 0, maximum: 14 },
					gain: { type: "number", minimum: -0.25, maximum: 1.0 },
				},
			},
		},
		vibratoEnabled: { type: "boolean" },
	},
	anyOf: [{ required: ["bands"] }, { required: ["vibratoEnabled"] }],
} as const;
type RadioRecentPlaysQuery = {
	limit?: number;
	beforeId?: number;
};

const recentPlaysQuerySchema = {
	type: "object",
	additionalProperties: false,
	properties: {
		limit: { type: "integer", minimum: 1, maximum: 100 },
		beforeId: { type: "integer", minimum: 1 },
	},
} as const;
export default async function player(fastify: FastifyInstance) {
	fastify.post(
		"/radio_player",
		{
			preHandler: requireGuildPermission,
			schema: { params: guildParamsSchema, body: presetBodySchema },
		},
		async (
			request: FastifyRequest<{
				Params: { id: string };
				Body: PresetBody;
			}>,
			reply: FastifyReply,
		) => {
			const { guildId, presetId } = request.body as {
				guildId: string;
				presetId: string;
			};
			if (guildId !== request.params.id) {
				return reply
					.code(400)
					.send({ error: "guildId must match route param id" });
			}

			const player = request.client.shoukaku.players.get(guildId);
			if (!player) return reply.code(404).send({ error: "Player not found" });

			const preset = equalizerPresets.find((p) => p.id === presetId);
			if (!preset) return reply.code(400).send({ error: "Invalid preset ID" });

			await player.setEqualizer(preset.gains);

			request.client.dashboard?.broadcastRadioUpdate(guildId, "radio_updated");

			return reply.send(request.client.radioStateManager.getInstance(guildId));
		},
	);

	fastify.patch(
		"/radio_player",
		{
			preHandler: requireGuildPermission,
			schema: {
				params: guildParamsSchema,
				body: eqBodySchema,
			},
			config: {
				rateLimit: { max: 120, timeWindow: "1 minute" },
			},
		},
		async (
			request: FastifyRequest<{
				Params: { id: string };
				Body: RadioPatchBody;
			}>,
			reply: FastifyReply,
		) => {
			const { guildId, bands, vibratoEnabled } = request.body;
			if (guildId !== request.params.id) {
				return reply
					.code(400)
					.send({ error: "guildId must match route param id" });
			}

			const player = request.client.shoukaku.players.get(guildId);
			if (!player) return reply.code(404).send({ error: "Player not found" });

			if (bands) {
				await player.setEqualizer(bands);
			}
			if (vibratoEnabled !== undefined) {
				await player.setVibrato(
					vibratoEnabled
						? { frequency: 10, depth: 1 }
						: { frequency: 0, depth: 0 },
				);
			}

			request.client.dashboard?.broadcastRadioUpdate(guildId, "radio_updated");
			return reply.code(204).send();
		},
	);
	fastify.get(
		"/radio_instance",
		{ preHandler: requireGuildPermission },
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			const playerInstance = request.client.radioStateManager.getInstance(
				request.params.id,
			);
			reply.send(playerInstance ?? null);
		},
	);
	fastify.get(
		"/radio_recent_plays",
		{
			preHandler: requireGuildPermission,
			schema: {
				params: guildParamsSchema,
				querystring: recentPlaysQuerySchema,
			},
		},
		async (
			request: FastifyRequest<{
				Params: { id: string };
				Querystring: RadioRecentPlaysQuery;
			}>,
			reply: FastifyReply,
		) => {
			const guildId = request.params.id;
			const limit = Math.min(request.query.limit ?? 20, 100);

			const rows = await request.client.prisma.radioRecentPlays.findMany({
				where: {
					guildId,
					...(request.query.beforeId
						? { id: { lt: request.query.beforeId } }
						: {}),
				},
				orderBy: { id: "desc" },
				take: limit,
			});

			const nextCursor =
				rows.length === limit ? rows[rows.length - 1].id : null;

			const userIds = [...new Set(rows.map((r) => r.userId).filter(Boolean))];

			const dbUsers = userIds.length
				? await request.client.prisma.users.findMany({
						where: { userId: { in: userIds } },
						select: { userId: true, username: true, avatar: true },
					})
				: [];
			const dbUserById = new Map(dbUsers.map((u) => [u.userId, u]));
			const guild = request.guild ?? request.client.guilds.cache.get(guildId);
			const memberEntries = await Promise.all(
				userIds.map(async (userId) => {
					try {
						const member = guild ? await guild.members.fetch(userId) : null;
						return [userId, member] as const;
					} catch {
						return [userId, null] as const;
					}
				}),
			);
			const memberById = new Map(memberEntries);
			//TODO: remove this
			const normalizeProvider = (
				provider: unknown,
			): "radio-garden" | "radio-browser" => {
				if (provider === "RADIO_GARDEN" || provider === "radio.garden")
					return "radio-garden";
				if (provider === "RADIO_BROWSER" || provider === "radio-browser")
					return "radio-browser";
				return "radio-garden";
			};
			const items = rows.map((row) => {
				const dbUser = dbUserById.get(row.userId);
				const member = memberById.get(row.userId);

				const username =
					dbUser?.username ??
					member?.displayName ??
					member?.user?.username ??
					row.userId;

				const avatar =
					dbUser?.avatar ||
					member?.displayAvatarURL?.() ||
					"https://cdn.discordapp.com/embed/avatars/0.png";

				const highestRole = member?.roles?.highest;
				const role =
					highestRole && highestRole.id !== guildId
						? highestRole.name
						: "Member";
				return {
					id: row.id,
					userId: row.userId,
					user: username,
					avatar,
					role,
					date: row.playedAt.getTime(),
					stationName: row.stationName,
					provider: normalizeProvider(row.provider),
				};
			});

			return reply.send({
				items,
				nextCursor,
			});
		},
	);
}
