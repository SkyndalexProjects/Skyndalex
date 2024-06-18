import type { SkyndalexClient } from "#classes";
import { ButtonBuilder } from "#builders";
import {
	ActionRowBuilder,
	type MessageComponentInteraction,
	ButtonStyle,
} from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	if (interaction.user.id !== interaction?.message?.interaction?.user?.id)
		return interaction.reply({
			content: "You can't use this button!",
			ephemeral: true,
		});

	try {
		const value = interaction.customId.split("-")[1];
		const name = interaction.message.embeds[0].description
			.split(":")[1]
			.replaceAll("**", "")
			.trim()
			.split("\n")[0];
		const currentFavorites = await client.prisma.favourties.findMany({
			where: {
				userId: interaction.user.id,
			},
		});

		if (currentFavorites.some((fav) => fav.radioId === value)) {
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder(client, interaction.locale)
					.setStyle(ButtonStyle.Danger)
					.setLabel("RADIO_FAVOURTIE_DELETED")
					.setCustomId(`addFavorite-${value}`),
			);

			await client.prisma.favourties.delete({
				where: {
					id: currentFavorites.find((fav) => fav.radioId === value)
						.id,
					userId: interaction.user.id,
					radioId: value,
				},
			});

			return interaction.update({
				components: [row],
			});
		}

		const add = await client.prisma.favourties.upsert({
			where: {
				userId: interaction.user.id,
				id: 0,
			},
			create: {
				userId: interaction.user.id,
				radioId: value,
				radioName: name,
			},
			update: {
				radioId: value,
				radioName: name,
			},
		});

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder(client, interaction.locale)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true)
				.setLabel("RADIO_FAVORITE_ADDED")
				.setCustomId("addedRadio"),
		);

		if (add) {
			return interaction.update({
				components: [row],
			});
		}
	} catch (e) {
		console.error(e);
		return interaction.reply({
			content: "An error occurred while adding",
			ephemeral: true,
		});
	}
}
