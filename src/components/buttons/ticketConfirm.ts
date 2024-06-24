import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";
import type { MessageComponentInteraction } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	const type = interaction.customId.split("-")[1];
	const embedFields = interaction.message.embeds[0].fields;

	switch (type) {
		case "buttonCreation": {
			const embedCategoryMissing = new EmbedBuilder(client, interaction.locale)
				.setDescription(client.i18n.t("TICKET_SETUP_NO_CATEGORY"))
				.setColor("Red");
		
			if (!embedFields[1])
				return interaction.reply({
					embeds: [embedCategoryMissing],
					ephemeral: true,
				});
		
			return interaction.reply({
				content: `Button name: ${embedFields[0].value}\nCategory: ${embedFields[1].value}`,
				ephemeral: true,
			});
		}
	case "selectCreation": {
		const embedSelectMissing = new EmbedBuilder(client, interaction.locale)
			.setDescription(client.i18n.t("TICKET_SETUP_NO_BUTTONS"))
			.setColor("Red");

		if (!embedFields[1])
			return interaction.reply({
				embeds: [embedSelectMissing],
				ephemeral: true,
			});
		return interaction.reply({
			content: `Select name: ${embedFields[0].value}\nValues: ${embedFields[1].value}`,
			ephemeral: true,
		});
	}
	}
}
