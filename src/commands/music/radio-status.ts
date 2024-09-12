import {
	ActionRowBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { TrackResult } from "shoukaku";
import { EmbedBuilder, ButtonBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import type { radioStationData } from "#types";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	if (!interaction.member.voice.channel) {
		return await interaction.reply({
			content: `${client.i18n.t("RADIO_JOIN_VOICE_CHANNEL", {
				lng: interaction.locale,
			})}`,
		});
	}

	const radio = client.radioInstances.get(interaction.guild.id);

	if (!radio)
		return await interaction.reply({
			content: `${client.i18n.t("RADIO_NOT_PLAYING", {
				lng: interaction.locale,
			})}`,
		});

	const getRadioData = await fetch(
		`https://radio.garden/api/ara/content/channel/${radio.radioStation}`,
	);

	const radioData = (await getRadioData.json()) as radioStationData;

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("RADIO_STATUS_TITLE")
		.setDescription("RADIO_STATUS_DESC", {
			title: radioData.data.title,
			stream: radioData.data.stream,
			requestedBy: radio.requestedBy,
			voiceChannelId: interaction.member.voice.channel.id,
		})
		.setColor("Green")
		.setTimestamp();

	const mp3Click = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder(client, interaction.locale)
			.setStyle(ButtonStyle.Link)
			.setLabel("mp3")
			.setURL(radio.resourceUrl),
	);

	return await interaction.reply({
		embeds: [embed],
		components: [mp3Click],
	});
}

export const data = new SlashCommandBuilder()
	.setName("radio-status")
	.setDescription("Current radio status");
