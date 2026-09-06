import {
	ChannelType,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

function formatDuration(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
	if (minutes > 0) return `${minutes}m ${seconds}s`;
	return `${seconds}s`;
}

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	const selectedChannel = interaction.options.getChannel("channel");
	const voiceChannel = selectedChannel ?? interaction.member.voice.channel;

	if (
		!voiceChannel ||
		(voiceChannel.type !== ChannelType.GuildVoice &&
			voiceChannel.type !== ChannelType.GuildStageVoice)
	) {
		return await interaction.reply({
			content:
				"Please select a voice channel or join one first to calculate listening time.",
			ephemeral: true,
		});
	}

	const guildId = interaction.guild.id;
	const channelId = voiceChannel.id;
	const now = Date.now();
	const totalsByUser = new Map<string, number>();

	for (const [key, totalMs] of client.voiceTotals) {
		const [storedGuildId, storedChannelId, storedUserId] = key.split(":");
		if (storedGuildId !== guildId || storedChannelId !== channelId) continue;
		totalsByUser.set(
			storedUserId,
			(totalsByUser.get(storedUserId) ?? 0) + totalMs,
		);
	}

	for (const [sessionKey, session] of client.voiceSessions) {
		if (session.guildId !== guildId || session.channelId !== channelId)
			continue;
		const [, storedUserId] = sessionKey.split(":");
		const ongoingMs = Math.max(0, now - session.joinedAt);
		totalsByUser.set(
			storedUserId,
			(totalsByUser.get(storedUserId) ?? 0) + ongoingMs,
		);
	}

	const rows = [...totalsByUser.entries()]
		.filter(([, totalMs]) => totalMs > 0)
		.sort((a, b) => b[1] - a[1]);

	if (rows.length === 0) {
		return await interaction.reply({
			content: `No listening time data found for <#${channelId}> yet.`,
			ephemeral: true,
		});
	}

	const summary = rows
		.slice(0, 25)
		.map(
			([userId, totalMs]) =>
				`<@${userId}> listened for ${formatDuration(totalMs)}`,
		)
		.join("\n");

	return await interaction.reply({
		content: `Listening time summary for <#${channelId}>:\n${summary}`,
	});
}

export const data = new SlashCommandBuilder()
	.setName("voicetime")
	.setDescription("Summarize how long users listened in a voice channel.")
	.addChannelOption((option) =>
		option
			.setName("channel")
			.setDescription("Voice channel to summarize")
			.addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
			.setRequired(false),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
