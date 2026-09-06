import {
	type ChatInputCommandInteraction,
	ContainerBuilder,
	MessageFlags,
	SlashCommandBuilder,
	TextDisplayBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	await interaction.deferReply();

	const guildId = interaction.guild.id;

	const memberChannel = interaction.member.voice.channel;

	if (!memberChannel) {
		return await interaction.editReply({
			content: `${client.i18n.t("RADIO_JOIN_VOICE_CHANNEL", {
				lng: interaction.locale,
			})}`,
		});
	}

	const getInstance = client.radioStateManager.getInstance(guildId);

	if (!getInstance) {
		return await interaction.editReply({
			content: "> No radio instance is currently active in this server.",
		});
	}

	await client.radioStateManager.deleteInstance(guildId);

	const title = new TextDisplayBuilder().setContent(
		"**Left & Radio instance deleted**\n\n-# Dashboard websocket informed successfully",
	);

	const container = new ContainerBuilder()
		.addTextDisplayComponents(title)
		.setAccentColor(0x3e6bff);

	await interaction.editReply({
		flags: MessageFlags.IsComponentsV2,
		components: [container],
	});
}

export const data = new SlashCommandBuilder()
	.setName("leave")
	.setDescription("Leave the voice channel and stop the radio");
