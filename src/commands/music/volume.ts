import {
	type ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	const volumeValue = interaction.options.getInteger("value", true);
	const player = client.shoukaku.players.get(interaction.guild.id);

	if (!player) {
		return await interaction.reply({
			content: `${client.i18n.t("VOLUME_NO_ACTIVE_PLAYER", {
				lng: interaction.locale,
			})}`,
			flags: MessageFlags.Ephemeral,
		});
	} else {
		await player.setGlobalVolume(volumeValue);
	}

	return await interaction.reply({
		content: `${client.i18n.t("VOLUME_SET_SUCCESS", {
			volume: volumeValue,
			lng: interaction.locale,
		})}`,
	});
}

export const data = new SlashCommandBuilder()
	.setName("volume")
	.setDescription("Change the volume of the current radio playback")
	.addIntegerOption((option) =>
		option
			.setName("value")
			.setDescription("Volume value between 0 and 100")
			.setRequired(true)
			.setMinValue(0),
	);
