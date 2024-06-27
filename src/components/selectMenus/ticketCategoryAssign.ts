import type { SkyndalexClient } from "#classes";
import { type StringSelectMenuInteraction, EmbedBuilder } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: StringSelectMenuInteraction,
) {
	const value = interaction.values[0];

	const embed = EmbedBuilder.from(interaction.message.embeds[0]);

	const existingField = embed.data.fields.find(
		(field) => field.name === client.i18n.t("TICKETS_SETUP_CATEGORY_SET"),
	);

	if (existingField) {
		existingField.value = `<#${value}> [\`${value}\`]`;
	} else {
		embed.addFields([
			{
				name: client.i18n.t("TICKETS_SETUP_CATEGORY_SET"),
				value: `<#${value}> [\`${value}\`]`,
				inline: true,
			},
		]);
	}

	await interaction.update({
		embeds: [embed],
	});
}
