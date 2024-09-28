import type { ModalSubmitInteraction } from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ModalSubmitInteraction,
) {
	const token = interaction.fields.getTextInputValue("token");
	const activity = interaction.fields.getTextInputValue("activity");

	const clientId = Buffer.from(token.split(".")[0], "base64").toString(
		"utf-8",
	);

	const invalidDataEmbed = new EmbedBuilder(client, interaction.locale)
		.setDescription("CUSTOMBOT_INVALID_DATA_DESCRIPTION")
		.setColor("Red");

	if (
		Number.isNaN(clientId) ||
		clientId === process.env.CLIENT_ID ||
		clientId.length < 17
	) {
		return interaction.reply({
			embeds: [invalidDataEmbed],
			ephemeral: true,
		});
	}

	const currentlyAvailableCustomBots =
		await client.prisma.custombots.findMany({
			where: {
				userId: interaction.user.id,
			},
		});
	const bot = await client?.users?.fetch(clientId).catch(() => null);

	if (!bot) {
		const embed = new EmbedBuilder(client, interaction.locale)
			.setDescription("CUSTOMBOT_NOT_FOUND", {
				botId: clientId,
			})
			.setColor("Red");

		return interaction.reply({ embeds: [embed], ephemeral: true });
	}
	if (
		currentlyAvailableCustomBots
			.map((bot) => bot.clientId)
			.includes(clientId)
	) {
		const embed = new EmbedBuilder(client, interaction.locale)
			.setDescription("CUSTOMBOT_ALREADY_EXISTS", {
				botName: bot.username,
				botId: clientId,
			})
			.setColor("Red");

		return interaction.reply({ embeds: [embed], ephemeral: true });
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
		.setDescription("CUSTOMBOT_CREATED", {
			botName: bot.username,
			botId: clientId,
		})
		.setColor("Green");

	return interaction.reply({ embeds: [embed], ephemeral: true });
}
