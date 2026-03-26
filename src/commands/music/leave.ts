import {
	type ChatInputCommandInteraction,
	ChannelType,
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	TextDisplayBuilder,
	Message,
} from "discord.js";
import { RadioProvider } from "@prisma/client";
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

	const getInstance = client.radioInstances.get(guildId);

	if (!getInstance) {
		return await interaction.editReply({
			content: "> No radio instance is currently active in this server.",
		});
	}

	client.radioInstances.delete(guildId);
	client.dashboard?.broadcastRadioUpdate(guildId, "radio_updated");

	await client.shoukaku.leaveVoiceChannel(interaction.guild.id);

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
