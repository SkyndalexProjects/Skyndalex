import type { SkyndalexClient } from "classes/Client";
import { ChannelSelectMenuBuilder } from "classes/builders/components/ChannelSelectMenuBuilder";
import { type MessageComponentInteraction, ActionRowBuilder } from "discord.js";

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

		return interaction.update({
			components: [
				new ActionRowBuilder<ChannelSelectMenuBuilder>({
					components: [channelSelectMenu],
				}),
			],
		});
	}
}
