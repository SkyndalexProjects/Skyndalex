import type { SkyndalexClient } from "#classes";
import { ChannelSelectMenuBuilder } from "#builders";
import {
	type MessageComponentInteraction,
	ActionRowBuilder,
	ChannelType,
} from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	const value = interaction.customId.split("-")[1];

	if (value.endsWith("Channel")) {
		const channelSelectMenu = new ChannelSelectMenuBuilder(
			client,
			interaction.locale,
		)
			.setPlaceholder("CONFIG_GUILD_CHANNEL_SELECT_PLACEHOLDER")
			.setCustomId(`configSelect-${value}`);

		if (value.endsWith("VoiceChannel")) {
			channelSelectMenu.setChannelTypes(ChannelType.GuildVoice);
		} else {
			channelSelectMenu.setChannelTypes(ChannelType.GuildText);
		}

		return interaction.update({
			components: [
				new ActionRowBuilder<ChannelSelectMenuBuilder>({
					components: [channelSelectMenu],
				}),
			],
		});
	}

	return interaction.reply({
		content: client.i18n.t("CONFIG_GUILD_CHANNEL_SELECT_ERROR", {
			lng: interaction.locale,
		}),
		ephemeral: true,
	});
}
