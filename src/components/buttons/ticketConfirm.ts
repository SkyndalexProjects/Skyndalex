import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";
import type { MessageComponentInteraction } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	const embedFields = interaction.message.embeds[0].fields;

	const embedMissing = new EmbedBuilder(client, interaction.locale)
		.setDescription(client.i18n.t("TICKET_SETUP_NO_CATEGORY"))
		.setColor("Red");

	if (!embedFields[1])
		return interaction.reply({
			embeds: [embedMissing],
			ephemeral: true,
		});

	return interaction.reply({
		content: `Button name: ${embedFields[0].value}\nCategory: ${embedFields[1].value}`,
		ephemeral: true,
	});
}
