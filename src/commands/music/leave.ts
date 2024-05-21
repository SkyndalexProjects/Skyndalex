import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client";
import { EmbedBuilder } from "../../classes/builders/EmbedBuilder";
import { getVoiceConnection } from "@discordjs/voice";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	try {
		await interaction.deferReply();
		const station = interaction.options.getString("station");
		const memberChannel = interaction.member.voice.channel;

		if (!memberChannel) {
			return interaction.editReply({
				content: `${client.i18n.t("RADIO_JOIN_VOICE_CHANNEL", {
					lng: interaction.locale,
				})}`,
				ephemeral: true,
			});
		}

		const connection = getVoiceConnection(memberChannel.guild.id);
		if (connection) {
			connection.destroy();
		} else {
			return interaction.editReply({
				content: `${client.i18n.t("VOICE_NOT_CONNECTED", {
					lng: interaction.locale,
				})}`,
				ephemeral: true,
			});
		}

		const embed = new EmbedBuilder(client, interaction.locale)
			.setDescription("VOICE_CHANNEL_LEFT")
			.setColor("DarkBlue");

		return await interaction.editReply({
			embeds: [embed],
		});
	} catch (e) {
		console.error(e);
	}
}

export const data = new SlashCommandBuilder()
	.setName("leave")
	.setDescription("Leave voice channel");
