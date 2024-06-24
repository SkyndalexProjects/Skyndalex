import type { SkyndalexClient } from "#classes";
import { ButtonBuilder, EmbedBuilder } from "#builders";
import { type MessageComponentInteraction, ActionRowBuilder, ButtonStyle } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	const type = interaction.customId.split("-")[1];
	const embedFields = interaction.message.embeds[0].fields;

	switch (type) {
		case "buttonCreation": {
			const embedCategoryMissing = new EmbedBuilder(
				client,
				interaction.locale,
			)
				.setDescription(client.i18n.t("TICKET_SETUP_NO_CATEGORY"))
				.setColor("Red");

			if (!embedFields[1])
				return interaction.reply({
					embeds: [embedCategoryMissing],
					ephemeral: true,
				});

			const discordChannelId = embedFields[1].value
				.split(" ")[1]
				.replace(/[^\d]/g, "");

			const getButtons = await client.prisma.ticketButtons.findMany({
				where: {
					guildId: interaction.guild.id,
					discordChannelId: discordChannelId,
				},
			});

			if (
				getButtons.some(
					(button) => button.label === embedFields[0].value,
				)
			) {
				// Get custom button customId to delete
				const customId = getButtons.find(
					(button) => button.label === embedFields[0].value,
				)?.customId;

				const deleteComponent = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder(client, interaction.locale)
						.setCustomId(`deleteTicketComponent-${embedFields[0].value}-${customId}`)
						.setLabel("DELETE_TICKET")
						.setStyle(ButtonStyle.Danger)
				);

				return interaction.reply({
					content: client.i18n.t("CUSTOM_BUTTON_ALREADY_EXISTS"),
					ephemeral: true,
					components: [deleteComponent],
				});
			}

			await client.prisma.ticketButtons.create({
				data: {
					label: embedFields[0].value,
					style: "PRIMARY", // TODO: Add custom button styles
					guildId: interaction.guild.id,
					discordChannelId: discordChannelId,
				},
			});

			const embedSuccess = new EmbedBuilder(client, interaction.locale)
				.setTitle("CUSTOM_BUTTON_ADD_SUCCESS")
				.setDescription("CUSTOM_BUTTON_ADD_SUCCESS_DESCRIPTION", {
					name: embedFields[0].value,
					channel: discordChannelId,
				})
				.setColor("Green");

			return interaction.reply({
				embeds: [embedSuccess],
				ephemeral: true,
			});
		}
		case "selectCreation": {
			const embedSelectMissing = new EmbedBuilder(
				client,
				interaction.locale,
			)
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
