import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();

	const reply = await interaction.fetchReply();

	if (!reply) {
		return interaction.editReply({ content: "Failed to measure latency." });
	}

	const wsLatency = client.ws.ping;
	const interactionTimestamp = interaction.createdTimestamp;
	const roundtrip = reply.createdTimestamp - interactionTimestamp;

	const latencyBar = buildBar(roundtrip, 500);
	const wsBar = buildBar(wsLatency, 500);

	const latencyColor =
		roundtrip < 100 ? 0x57f287 : roundtrip < 250 ? 0xfee75c : 0xed4245;

	const embed = new EmbedBuilder()
		.setTitle("🏓 Pong!")
		.setColor(latencyColor)
		.addFields(
			{
				name: "📡 Roundtrip Latency",
				value: `${latencyBar} \`${roundtrip}ms\``,
				inline: false,
			},
			{
				name: "🌐 WebSocket Latency",
				value: `${wsBar} \`${wsLatency}ms\``,
				inline: false,
			},
			{
				name: "📶 Status",
				value: getStatusLabel(roundtrip),
				inline: true,
			},
		)
		.setTimestamp();

	await interaction.editReply({ embeds: [embed] });
}

function buildBar(value: number, max: number, length = 10): string {
	const filled = Math.round((Math.min(value, max) / max) * length);
	const empty = length - filled;
	return `${"█".repeat(filled)}${"░".repeat(empty)}`;
}

function getStatusLabel(ms: number): string {
	if (ms < 100) return "🟢 Excellent";
	if (ms < 200) return "🟡 Good";
	if (ms < 350) return "🟠 Not excellent";
	return "🔴 Poor";
}

export const data = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("Check bot latency and connection status.")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
