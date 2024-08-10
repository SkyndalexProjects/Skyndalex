import type { ModalSubmitInteraction } from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";

export async function run(
	client: SkyndalexClient,
	interaction: ModalSubmitInteraction,
) {
	const token = interaction.fields.getTextInputValue("token");
	const activity = interaction.fields.getTextInputValue("activity");

	const clientId = Buffer.from(token.split(".")[0], "base64").toString(
		"utf-8",
	);

	if (isNaN(Number(clientId))) {
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

	await client.prisma.customBotSettings.create({
		data: {
			clientId,
			userId: interaction.user.id,
			guildId: interaction.guild.id,
		},
	});

	const bot = await client.users.fetch(clientId);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setDescription("CUSTOMBOT_CREATED", {
			botName: bot.username,
			botId: clientId,
		})
		.setColor("Green");

	return interaction.reply({ embeds: [embed], ephemeral: true });
}
