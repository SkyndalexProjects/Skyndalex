import {
	ActionRowBuilder,
	ChannelType,
	type MessageComponentInteraction,
} from "discord.js";
import { ChannelSelectMenuBuilder, RoleSelectMenuBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

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
	if (value.endsWith("Role")) {
		const roleSelectMenu = new RoleSelectMenuBuilder(
			client,
			interaction.locale,
		)
			.setPlaceholder("CONFIG_GUILD_ROLE_SELECT_PLACEHOLDER")
			.setCustomId(`configSelect-${value}`);

		return interaction.update({
			components: [
				new ActionRowBuilder<RoleSelectMenuBuilder>({
					components: [roleSelectMenu],
				}),
			],
		});
	}
	if (value.endsWith("Category")) {
		const categorySelectMenu = new ChannelSelectMenuBuilder(
			client,
			interaction.locale,
		)
			.setPlaceholder("CONFIG_GUILD_CATEGORY_SELECT_PLACEHOLDER")
			.setCustomId(`configSelect-${value}`)
			.setChannelTypes(ChannelType.GuildCategory);

		return interaction.update({
			components: [
				new ActionRowBuilder<ChannelSelectMenuBuilder>({
					components: [categorySelectMenu],
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
