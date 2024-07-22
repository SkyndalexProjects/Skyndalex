import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#classes/builders";
import { parseCommands } from "#utils";
import { REST, Routes, type ModalSubmitInteraction } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: ModalSubmitInteraction,
) {
	const token = interaction.fields.getTextInputValue("token");
	const activity = interaction.fields.getTextInputValue("activity");

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

	const commands = parseCommands(client);
	const customRest = new REST().setToken(token);
	customRest.put(Routes.applicationCommands(clientId), {
		body: commands,
	});

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOMBOT_CREATED")
		.setDescription("CUSTOMBOT_CREATED_DESCRIPTION");

	return interaction.reply({ embeds: [embed], ephemeral: true });
}
