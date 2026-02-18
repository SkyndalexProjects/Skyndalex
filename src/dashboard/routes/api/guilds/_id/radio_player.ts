import { ChannelType, PermissionFlagsBits } from "discord.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
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

interface radioPlayerBody {
	presetId: string;
	guildId: string;
}

export default async function player(fastify: FastifyInstance) {
	fastify.post(
		"/radio_player",
		{ preHandler: requireGuildPermission },
		async (
			request: FastifyRequest<{
				Params: { id: string };
				Body: radioPlayerBody;
			}>,
			reply: FastifyReply,
		) => {
			const { presetId, guildId } = request.body;

			const playerInstance = request.client.radioInstances.get(guildId);
			const player = request.client.shoukaku.players.get(guildId);

			if (!player) {
				return reply.status(404).send({ error: "Player not found" });
			}

			const preset = equalizerPresets.find((p) => p.id === presetId);

			if (!preset) {
				return reply.status(400).send({ error: "Invalid preset ID" });
			}

			await player.setEqualizer(preset.gains);

			reply.send(playerInstance);
		},
	);
	fastify.get(
		"/radio_instance",
		{ preHandler: requireGuildPermission },
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			const guildId = request.params.id;
			const playerInstance = request.client.radioInstances.get(guildId);
			reply.send(playerInstance);
		},
	);
}
