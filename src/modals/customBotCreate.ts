import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#classes/builders";
import type { ModalSubmitInteraction } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: ModalSubmitInteraction,
) {
	const token = interaction.fields.getTextInputValue("token");
	const activity = interaction.fields.getTextInputValue("activity");
	console.log("token", token);
	const clientId = Buffer.from(token.split(".")[0], "base64").toString(
		"utf-8",
	);

	if (!clientId) {
		console.log("true");
		const invalidDataEmbed = new EmbedBuilder(client, interaction.locale)
			.setDescription("CUSTOMBOT_INVALID_DATA_DESCRIPTION")
			.setColor("Red");

		return interaction.reply({ embeds: [invalidDataEmbed] });
	}

	await client.prisma.custombots.create({
		data: {
			token,
			clientId,
			userId: interaction.user.id,
			activity,
		},
	});

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOMBOT_CREATED")
		.setDescription("CUSTOMBOT_CREATED_DESCRIPTION");

	return interaction.reply({ embeds: [embed], ephemeral: true });
}
