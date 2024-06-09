import type { SkyndalexClient } from "#classes";
import { ButtonBuilder, EmbedBuilder } from "#builders";
import {
	ButtonStyle,
	type StringSelectMenuInteraction,
	ActionRowBuilder,
} from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: StringSelectMenuInteraction,
) {
	const value = interaction.values[0];
	const changeButton = new ButtonBuilder(client, interaction.locale)
		.setCustomId(`change-${value}`)
		.setLabel("CONFIG_CHANGE_BUTTON")
		.setStyle(ButtonStyle.Primary);

	const disableButton = new ButtonBuilder(client, interaction.locale)
		.setCustomId(`disable-${value}`)
		.setLabel("CONFIG_DISABLE_BUTTON")
		.setStyle(ButtonStyle.Danger);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CONFIG_GUILD_TITLE")
		.setColor("Yellow")
		.setDescription("CONFIG_STATUS_DESCRIPTION", {
			value,
		});

	return interaction.update({
		embeds: [embed],
		components: [
			new ActionRowBuilder<ButtonBuilder>({
				components: [changeButton, disableButton],
			}),
		],
	});
}
