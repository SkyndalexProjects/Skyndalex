import type { MessageComponentInteraction } from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	await interaction.deferUpdate();

	if (!interaction.guildId) {
		return await interaction.followUp({
			content: "This button can only be used in a server.",
			flags: 64,
		});
	}

	const instance = client.radioStateManager.getInstance(interaction.guildId);
	if (!instance) {
		return await interaction.followUp({
			content: "No active radio station found to play.",
			flags: 64,
		});
	}

	const memberChannel =
		interaction.member && "voice" in interaction.member
			? interaction.member.voice.channel
			: null;

	if (!memberChannel) {
		return await interaction.followUp({
			content: "Join a voice channel first to play the radio.",
			flags: 64,
		});
	}

	const result = await client.radio.startRadio(
		client,
		instance.stationSource,
		interaction.guildId,
		memberChannel.id,
		interaction.user.id,
		instance.provider,
		interaction,
	);

	if (result?.action === "error") {
		return await interaction.followUp({
			content: "❌ Could not start playback for this radio station.",
			flags: 64,
		});
	}

	return await interaction.followUp({
		content: `▶️ Playing **${instance.radioStation}** again.`,
		flags: 64,
	});
}
